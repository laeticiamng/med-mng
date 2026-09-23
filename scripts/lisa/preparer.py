"""Prépare le contenu officiel LiSA 2026 des 4872 objectifs OIC pour MED MNG.

Entrée : lisa-oic-2026.json (relevé dans le navigateur connecté à LiSA).
Sortie : oic-2026.json — pour chaque objectif :
  description  : contenu COMPLET en texte structuré (recherche, quiz, IA)
  sommaire     : descriptif officiel court (champ « Description » de LiSA)
  html         : contenu complet rendu (tableaux, listes, gras, images)
  images       : [{source, cible}] à copier dans le stockage MED MNG
"""
import hashlib, json, re, sys
from urllib.parse import unquote, urljoin
from bs4 import BeautifulSoup, Comment, NavigableString, Tag

SRC = sys.argv[1]
OUT = sys.argv[2]
IMG_BASE = 'https://yaincoxihiqdksxgrsrk.supabase.co/storage/v1/object/public/oic-images/'
LISA = 'https://livret.uness.fr'

AUTORISES = {'p', 'br', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
             'b', 'strong', 'i', 'em', 'u', 'sup', 'sub', 'h2', 'h3', 'h4', 'h5', 'a', 'img', 'figure', 'figcaption',
             'blockquote', 'ins', 'pre', 'code', 'hr', 'div', 'span', 'small', 's', 'del', 'center', 'font'}
ATTRS = {'a': {'href'}, 'img': {'src', 'alt', 'width', 'height'}, 'td': {'colspan', 'rowspan'}, 'th': {'colspan', 'rowspan'},
         'table': {'class'}, 'ol': {'start', 'type'}}


def nom_image(url: str) -> str:
    ext = re.sub(r'[^a-z0-9]', '', url.rsplit('.', 1)[-1].lower())[:5] or 'png'
    return hashlib.sha1(url.encode()).hexdigest()[:20] + '.' + ext


def nettoyer(html: str, images: dict) -> str:
    s = BeautifulSoup(html, 'lxml')
    corps = s.body or s
    for c in corps.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    for t in corps.select('.mw-editsection, .mw-empty-elt, link, meta, style, script, .toc, #toc, noscript'):
        t.decompose()
    # images : source d'origine (pleine taille si miniature), copiée chez nous
    for img in corps.find_all('img'):
        src = img.get('src') or ''
        m = re.match(r'(/lisa/2026/images)/thumb/(.+?/[^/]+)/[^/]+$', src)
        orig = f'{m.group(1)}/{m.group(2)}' if m else src
        absolu = urljoin(LISA, orig)
        cible = nom_image(absolu)
        images[absolu] = cible
        img.attrs = {k: v for k, v in img.attrs.items() if k in ('alt', 'width', 'height')}
        img['src'] = IMG_BASE + cible
        img['loading'] = 'lazy'
    for a in corps.find_all('a'):
        href = a.get('href') or ''
        interne = href.startswith('/lisa/') or 'livret.uness.fr' in href or href.startswith('#') or not href
        if 'new' in (a.get('class') or []) or interne:
            a.unwrap()
        else:
            a.attrs = {'href': href, 'target': '_blank', 'rel': 'noopener noreferrer'}
    # galeries MediaWiki -> figures simples
    for g in corps.select('ul.gallery'):
        fig = s.new_tag('div')
        for li in g.select('li.gallerybox'):
            f = s.new_tag('figure')
            img = li.find('img')
            if img:
                f.append(img.extract())
            cap = li.select_one('.gallerytext')
            if cap and cap.get_text(strip=True):
                fc = s.new_tag('figcaption')
                fc.string = cap.get_text(' ', strip=True)
                f.append(fc)
            fig.append(f)
        g.replace_with(fig)
    for t in list(corps.find_all(True)):
        if t.name in ('html', 'body'):
            continue
        if t.name not in AUTORISES:
            t.unwrap()
            continue
        garder = ATTRS.get(t.name, set()) | ({'target', 'rel'} if t.name == 'a' else set()) | ({'loading'} if t.name == 'img' else set())
        t.attrs = {k: v for k, v in t.attrs.items() if k in garder}
        if t.name == 'table':
            t['class'] = 'wikitable'
    # div/span sans attribut : aplatir les span
    for sp in corps.find_all('span'):
        sp.unwrap()
    out = ''.join(str(x) for x in corps.contents).strip()
    out = re.sub(r'(<p>\s*(<br/?>)?\s*</p>\s*)+$', '', out)
    out = re.sub(r'\n{3,}', '\n\n', out)
    return out


def texte(html: str) -> str:
    s = BeautifulSoup(html, 'lxml')
    lignes = []

    def propre(t):
        return re.sub(r'\s+', ' ', t).strip()

    def visiter(n, niveau=0):
        for c in n.children:
            if isinstance(c, NavigableString):
                t = propre(str(c))
                if t:
                    lignes.append(t)
                continue
            if not isinstance(c, Tag):
                continue
            if c.name in ('h2', 'h3', 'h4', 'h5'):
                lignes.append('\n## ' + propre(c.get_text(' ')))
            elif c.name in ('ul', 'ol'):
                for i, li in enumerate(c.find_all('li', recursive=False), 1):
                    sous = [x for x in li.find_all(['ul', 'ol'], recursive=False)]
                    for x in sous:
                        x.extract()
                    puce = f'{i}.' if c.name == 'ol' else '-'
                    t = propre(li.get_text(' '))
                    if t:
                        lignes.append('  ' * niveau + f'{puce} {t}')
                    for x in sous:
                        visiter(BeautifulSoup(f'<div>{x}</div>', 'lxml').div, niveau + 1)
            elif c.name == 'table':
                cap = c.find('caption')
                if cap and propre(cap.get_text(' ')):
                    lignes.append(propre(cap.get_text(' ')))
                for img in c.find_all('img'):
                    if propre(img.get('alt') or ''):
                        lignes.append('[Figure : ' + propre(img['alt']) + ']')
                for tr in c.find_all('tr'):
                    cells = [propre(td.get_text(' ')) for td in tr.find_all(['td', 'th'])]
                    if any(cells):
                        lignes.append('| ' + ' | '.join(cells) + ' |')
                lignes.append('')
            elif c.name == 'img':
                if propre(c.get('alt') or ''):
                    lignes.append('[Figure : ' + propre(c['alt']) + ']')
            elif c.name in ('p', 'dd', 'dt', 'blockquote', 'ins', 'pre', 'figcaption', 'caption'):
                t = propre(c.get_text(' '))
                if t:
                    lignes.append(t)
            else:
                visiter(c, niveau)

    visiter(s.body or s)
    t = '\n'.join(lignes)
    t = re.sub(r'\n{3,}', '\n\n', t).strip()
    return t


def main():
    d = json.load(open(SRC))
    images = {}
    sortie = []
    for o in d['objectifs']:
        html = nettoyer(o['html'], images) if o['html'].strip() else ''
        txt = texte(html) if html else ''
        if not txt.strip():
            txt = o['description_officielle']
        page = o['page']
        sortie.append({
            'id': o['id'], 'item': o['item'], 'rang': o['rang'], 'intitule': o['intitule'],
            'rubrique': o['rubrique'], 'ordre': o['ordre'],
            'sommaire': o['description_officielle'],
            'description': txt,
            'html': html,
            'maj_lisa': o['maj'],
            'url_source': 'https://livret.uness.fr/lisa/2026/' + page.replace(' ', '_'),
            'hash': hashlib.sha256((o['wikitext'] or '').encode()).hexdigest()[:32],
        })
    json.dump({'source': d['source'], 'releve_le': d['releve_le'], 'objectifs': sortie,
               'images': [{'source': k, 'cible': v} for k, v in sorted(images.items())]},
              open(OUT, 'w'), ensure_ascii=False)
    print(len(sortie), 'objectifs,', len(images), 'images')


main()

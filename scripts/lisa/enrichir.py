"""Enrichit le référentiel préparé (preparer.py) avant intégration dans MED MNG.

1. Errata (errata.json) : LiSA contient des coquilles et erreurs évidentes (unités,
   termes, titres de tableau). Elles sont corrigées dans le texte ET le rendu, et
   chaque correction est conservée (avant / après / motif) pour être affichée à
   l'étudiant : on ne corrige jamais en silence.
2. Transcriptions (transcriptions.json) : pour les compétences dont le contenu
   officiel n'existe que sous forme de figure ou de document (schéma, tableau,
   algorithme, PDF), le contenu de la figure est transcrit en texte, sous une
   rubrique distincte « Transcription de la figure officielle ».

Usage : python3 enrichir.py oic-2026.json errata.json transcriptions.json sortie.json
"""
import html as H
import json
import re
import sys

from bs4 import BeautifulSoup, NavigableString

src, f_errata, f_transcr, out = sys.argv[1:5]
d = json.load(open(src))
errata = json.load(open(f_errata))
transcr = {t['id']: t for t in json.load(open(f_transcr))}


def texte_vers_html(t: str) -> str:
    """Format simple des transcriptions : « ## titre », « - puce » (2 espaces = sous-niveau), « | a | b | »."""
    lignes = t.split('\n')
    out, pile, table = [], [], []

    def fermer_listes(niveau=0):
        while len(pile) > niveau:
            out.append('</li></ul>' if pile.pop() else '</ul>')

    def vider_table():
        if table:
            rows = [[H.escape(c.strip()) for c in r.strip().strip('|').split('|')] for r in table]
            h = '<table class="wikitable"><tbody>' + ''.join(
                '<tr>' + ''.join((f'<th>{c}</th>' if i == 0 else f'<td>{c}</td>') for c in r) + '</tr>'
                for i, r in enumerate(rows)) + '</tbody></table>'
            out.append(h)
            table.clear()

    for l in lignes:
        if not l.strip():
            continue
        if l.strip().startswith('|'):
            fermer_listes(); table.append(l); continue
        vider_table()
        m = re.match(r'^(\s*)- (.*)$', l)
        if m:
            niv = len(m.group(1)) // 2 + 1
            while len(pile) < niv:
                out.append('<ul>'); pile.append(False)
            fermer_listes(niv)
            if pile[-1]:
                out.append('</li>')
            out.append(f'<li>{H.escape(m.group(2))}')
            pile[-1] = True
            continue
        fermer_listes()
        if l.startswith('## '):
            out.append(f'<h4>{H.escape(l[3:])}</h4>')
        else:
            out.append(f'<p>{H.escape(l)}</p>')
    fermer_listes(); vider_table()
    return ''.join(out)


non_trouves = []
for o in d['objectifs']:
    corrections = []
    # 1. transcription
    t = transcr.get(o['id'])
    if t and t['type'] in ('transcription', 'photo') and t['texte'].strip():
        titre = 'Transcription de la figure officielle' if t['type'] == 'transcription' else 'Description de la figure officielle'
        o['html'] = (o['html'] or '') + f'<div class="transcription-medmng"><h4>{titre}</h4>{texte_vers_html(t["texte"])}</div>'
        o['description'] = (o['description'] or '').rstrip() + f'\n\n## {titre}\n' + t['texte'].strip()
        o['transcription'] = t['type']
    # 2. errata
    for e in errata:
        if e['id'] not in ('*', o['id']):
            continue
        une = e.get('premiere_seulement', False)
        trouve = False
        if e['avant'] in o['description']:
            o['description'] = o['description'].replace(e['avant'], e['apres'], 1 if une else -1)
            trouve = True
        s = BeautifulSoup(o['html'] or '', 'lxml')
        fait = False
        # texte réparti sur plusieurs balises : remplacements propres au rendu HTML
        for r in e.get('html_remplacements') or [{'avant': e['avant'], 'apres': e['apres']}]:
            fait_r = False
            for n in list(s.find_all(string=True)):
                if r['avant'] in n and not (une and fait_r):
                    n.replace_with(NavigableString(str(n).replace(r['avant'], r['apres'], 1 if une else -1)))
                    fait_r = fait = True
        if fait:
            corps = s.body or s
            o['html'] = ''.join(str(x) for x in corps.contents)
            trouve = True
        if trouve:
            corrections.append({'avant': e['avant'], 'apres': e['apres'], 'motif': e['motif']})
        elif e['id'] != '*':
            non_trouves.append((o['id'], e['avant']))
    if corrections:
        o['corrections'] = corrections

json.dump(d, open(out, 'w'), ensure_ascii=False)
print('transcriptions', sum(1 for o in d['objectifs'] if o.get('transcription')),
      '| compétences corrigées', sum(1 for o in d['objectifs'] if o.get('corrections')),
      '| errata introuvables', non_trouves)

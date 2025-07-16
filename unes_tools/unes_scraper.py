import os
import re
import time
import sys
from pathlib import Path
import requests
from bs4 import BeautifulSoup

sys.path.append(str(Path(__file__).resolve().parent))
from upload_to_supabase import upsert_item, upsert_competence

UNES_EMAIL = os.getenv('UNES_EMAIL')
UNES_PASSWORD = os.getenv('UNES_PASSWORD')

BASE_URL = 'https://livret.uness.fr'
LIST_URL = f'{BASE_URL}/lisa/2025/Catégorie:Objectif_de_connaissance'
ITEM_URL_TEMPLATE = f'{BASE_URL}/lisa/2025/Item_de_connaissance_%d'


class UNESScraper:
    def __init__(self):
        if not UNES_EMAIL or not UNES_PASSWORD:
            raise RuntimeError('UNES credentials missing')
        self.session = requests.Session()

    def authenticate(self):
        # step 1: email
        self.session.post(
            'https://cockpit.uness.fr/api/auth/email',
            json={'email': UNES_EMAIL},
            headers={'Accept': 'application/json'}
        )
        # step 2: password
        self.session.post(
            'https://cockpit.uness.fr/login',
            data={'email': UNES_EMAIL, 'password': UNES_PASSWORD},
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

    def fetch_printable(self, url: str) -> str:
        r = self.session.get(url)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        link = soup.find('a', string=re.compile('version imprimable', re.I))
        if link and link.get('href'):
            printable_url = link['href']
            if not printable_url.startswith('http'):
                printable_url = BASE_URL + printable_url
            r = self.session.get(printable_url)
            r.raise_for_status()
            return r.text
        return r.text

    def parse_competences(self, html: str):
        soup = BeautifulSoup(html, 'html.parser')
        rang_a, rang_b = [], []
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'])
        for h in headings:
            text = h.get_text().lower()
            if 'rang a' in text:
                rang_a += self._extract_section_text(h)
            if 'rang b' in text:
                rang_b += self._extract_section_text(h)
        return rang_a, rang_b

    def _extract_section_text(self, heading):
        content = []
        for sib in heading.find_next_siblings():
            if sib.name in ['h1', 'h2', 'h3', 'h4', 'h5']:
                break
            if sib.name in ['p', 'li']:
                text = sib.get_text(strip=True)
                if text:
                    content.append(text)
        return content

    def run(self, start=1, end=367):
        self.authenticate()
        for i in range(start, end + 1):
            url = ITEM_URL_TEMPLATE % i
            try:
                html = self.fetch_printable(url)
            except requests.HTTPError:
                continue
            soup = BeautifulSoup(html, 'html.parser')
            title_tag = soup.find('h1') or soup.find('title')
            titre = title_tag.get_text(strip=True) if title_tag else f'Item {i}'
            item_id = upsert_item(i, titre, html)
            rang_a, rang_b = self.parse_competences(html)
            for text in rang_a:
                upsert_competence(item_id, 'A', text)
            for text in rang_b:
                upsert_competence(item_id, 'B', text)
            time.sleep(1)


def main():
    scraper = UNESScraper()
    scraper.run()


if __name__ == '__main__':
    main()



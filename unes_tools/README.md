# UNES Scraper

This folder contains helper scripts to extract items from the UNES LiSA 2025 platform and store them in Supabase.

## Files

- `unes_scraper.py` – main scraper that authenticates to UNES, retrieves each item and its printable version, then saves the data in Supabase.
- `upload_to_supabase.py` – small helper exposing functions to upsert items and competences using the Supabase API.
- `audit_items.py` – verifies that all items are stored and that each has at least one competence of rank A. Outputs an `incomplets.json` report.

## Usage

1. Install Python dependencies:
   ```bash
   pip install requests beautifulsoup4 supabase
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase and UNES credentials.
3. Run the scraper:
   ```bash
   python unes_scraper.py
   ```
4. To verify the database content:
   ```bash
   python audit_items.py
   ```

All scripts rely on the following environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UNES_EMAIL`
- `UNES_PASSWORD`


# Data Cleaning Process

The `scripts/auto-clean-oic.ts` script analyses OIC records after each extraction and triggers automatic fixes when corruption exceeds 2% of the dataset.

## Usage

```bash
pnpm ts-node scripts/auto-clean-oic.ts
```

The script logs analysis and fix reports under the `logs/` directory using timestamped JSON files.
If `RESEND_API_KEY` and `ALERT_EMAIL` are provided in the environment, an alert email is sent when the corruption ratio is greater than 2%.

## Troubleshooting

- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
- Email alerts require valid `RESEND_API_KEY` and `ALERT_EMAIL`.
- Check the JSON files in `logs/` for detailed reports.

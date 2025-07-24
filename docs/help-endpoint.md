# Onboarding & Help Endpoint

This endpoint exposes onboarding steps and contextual help so the frontend can dynamically display messages.

## Database

Onboarding content is stored in the `onboarding_steps` table:

- `id` UUID primary key
- `key` unique identifier for the tip
- `title` JSONB object with translations
- `body` JSONB object with translations
- `type` hint category (`onboarding`, `tooltip`...)
- `version` integer version number
- `is_active` boolean flag
- `created_at` and `updated_at` timestamps

Row level security allows public read access while keeping write access to the service role.

## Endpoint

`GET /help/onboarding?lang=fr`

Returns all active steps sorted by `id`. The `lang` query parameter selects the desired language (defaults to `en`).

Example response:
```json
{
  "steps": [
    {
      "id": 1,
      "key": "welcome",
      "title": "Bienvenue !",
      "body": "Découvrez comment générer vos premières chansons…",
      "type": "onboarding",
      "version": 1,
      "is_active": true
    }
  ]
}
```

If a translation is missing for the requested language, the English text is used as fallback.

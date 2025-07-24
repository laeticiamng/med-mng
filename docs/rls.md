# Row Level Security Policies

This document lists the RLS configuration for sensitive tables. Each table has policies limiting access to the appropriate roles and enabling full access for `service_role`.

## edn_items_immersive
- **Public**: read-only access.
- **service_role**: full access to bypass restrictions.

## med_mng_items and related tables
Tables: `med_mng_items`, `comic_panels`, `roman_versions`, `music_tracks`, `quiz_questions`, `audit_logs`.
- **Users**: can manage rows where `user_id` matches their auth id (except `audit_logs` which is service-only).
- **service_role**: full access for backend operations.

## oic_competences & oic_extraction_progress
- **Public**: read-only access to `oic_competences`.
- **service_role**: full access to both tables.

The migration `20250801000000-12ffeeb7-77f2-46a2-8bdc-1338b6c22781.sql` enforces these policies and ensures RLS is enabled on all relevant tables.

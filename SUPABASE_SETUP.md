# Supabase setup

1. Create a Supabase project and run `supabase/migrations/001_trendora_store.sql` in its SQL editor.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the server environment. Never expose the service-role key to browser code or use a `NEXT_PUBLIC_` prefix.
3. Before deploying or opening the app, import any existing `data/store.json` data with `npm run db:import` from a trusted local environment configured with the server-only Supabase variables. The command refuses to overwrite an initialized database. Review the data and confirm you intend to transfer it to your selected Supabase project before running it. For safety, legacy `verified` payments are reset to pending and previously active shops are returned to a private pending status for administrator re-verification.
4. Configure `AUTH_SECRET` with at least 32 random characters and set a unique `ADMIN_PASSWORD`.
5. Deploy the application. If the store is empty, the first server-side database read initializes it; existing data is not overwritten.

The current application data model is stored as a single versioned JSONB record to preserve the existing `readDb`/`mutateDb` API while making writes durable and concurrency-checked. This is not a normalized relational schema. Before scaling or enabling direct client database access, migrate the application entities and relationships to dedicated tables.

Shop payments are submitted as unverified records and require explicit administrator verification. No payment gateway is connected. Configure the actual registration fee and payment instructions in the admin dashboard before accepting applications; do not treat a submitted transaction reference as proof of payment.

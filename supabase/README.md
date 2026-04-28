# Supabase

## Migrations

Apply migrations in `supabase/migrations/` to the Supabase project before enabling persistence.

The server uses `SUPABASE_SERVICE_ROLE_KEY` from API routes only. Do not expose the service role key to browser code.

## Runtime Mode

- Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`: API routes use the in-memory mock store.
- Both values present: API routes use Supabase tables.

#!/usr/bin/env bash
# Runs the migrations + security tests against a throwaway local PostgreSQL.
# Needs PostgreSQL 15+ installed locally (psql + createdb). Uses DB "bizelinks_test".
set -euo pipefail
DB=bizelinks_test
dropdb --if-exists "$DB" >/dev/null 2>&1 || true
createdb "$DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/supabase_stubs.sql
for f in supabase/migrations/*.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"
done
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/security_tests.sql
dropdb "$DB"

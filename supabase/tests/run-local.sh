#!/usr/bin/env bash
# Applies all migrations to a throwaway local Postgres (with a minimal Supabase
# stub) and runs the security tests. Requires Postgres 15+ binaries on PATH or
# in /usr/lib/postgresql/*/bin.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="$(dirname "$(command -v initdb 2>/dev/null || ls -d /usr/lib/postgresql/*/bin/initdb | tail -1)")"
WORK="$(mktemp -d)"
PORT="${PGTEST_PORT:-54329}"
trap '"$PGBIN/pg_ctl" -D "$WORK/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

"$PGBIN/initdb" -D "$WORK/data" -U postgres -A trust >/dev/null
"$PGBIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" start >/dev/null

PSQL=("$PGBIN/psql" -h "$WORK" -p "$PORT" -U postgres -d postgres -q -v ON_ERROR_STOP=1)

"${PSQL[@]}" -f "$ROOT/supabase/tests/supabase_stub.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  # pg_cron is not available on a plain local Postgres; the stub provides cron.schedule.
  sed 's/^create extension if not exists pg_cron;//' "$f" | "${PSQL[@]}" -f -
done
"${PSQL[@]}" -o /dev/null -f "$ROOT/supabase/seed/blog_starter.sql"
"${PSQL[@]}" -o /dev/null -f "$ROOT/supabase/tests/security_tests.sql"
echo "All database security tests passed."

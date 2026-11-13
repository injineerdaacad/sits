#!/usr/bin/env bash
# Test the RLS policies on a throwaway local PostgreSQL (no Supabase needed).
#   supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")"
BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
DIR="$(mktemp -d)"; PORT="${PG_PORT:-55433}"
trap '"$BIN/pg_ctl" -D "$DIR/data" stop -m fast >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
"$BIN/initdb" -D "$DIR/data" -U postgres -A trust >/dev/null
"$BIN/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR -c listen_addresses=''" -l "$DIR/log" start >/dev/null
PSQL=(psql -h "$DIR" -p "$PORT" -U postgres -q -v ON_ERROR_STOP=1)
"${PSQL[@]}" -f stub_schema.sql
"${PSQL[@]}" -f ../migrations/20261113000000_row_level_security.sql 2>/dev/null
"${PSQL[@]}" -f ../migrations/20261113000000_row_level_security.sql 2>/dev/null   # must be re-runnable
OUT="$("${PSQL[@]}" -f rls_test.sql 2>&1 | grep -oE '(PASS|FAIL): .*|ERROR.*' || true)"
echo "$OUT"
PASS=$(grep -c '^PASS' <<<"$OUT" || true); FAIL=$(grep -cv '^PASS' <<<"$OUT" || true)
echo; echo "passed: $PASS  failed: $FAIL"
[[ "$FAIL" -eq 0 && "$PASS" -gt 0 ]]

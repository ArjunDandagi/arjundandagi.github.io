#!/bin/zsh
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8765}"

echo "telc Deutsch A1 — Übungsprüfungen"
echo
echo "  Öffne http://127.0.0.1:${PORT}"
echo "  Beenden mit Strg+C"
echo
echo "Kopfhörer aufsetzen. Die Aufnahmen laufen wie in der Prüfung:"
echo "Teil 1 und 3 zweimal, Teil 2 nur einmal."
echo

exec python3 -m http.server "$PORT" --bind 127.0.0.1

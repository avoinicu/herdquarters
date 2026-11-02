#!/bin/sh
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d "${TMPDIR:-/tmp}/herdquarters.XXXXXX")
trap 'rm -rf "$tmp"' EXIT HUP INT TERM

mods='compact-spaces compact-agents compact-footer compact-tabs
compact-menu compact-new-menu compact-worktree compact-machine-add
compact-prompt compact-confirm'

HERDR_APP_HOME="$tmp/fresh home" "$root/install.sh"
for file in themes/night-owl.json layouts/herdquarters.json layouts/herdquarters.svg; do
  cmp "$root/$file" "$tmp/fresh home/$file"
done
for mod in $mods; do
  for file in main.js mod.json; do
    cmp "$root/mods/$mod/$file" "$tmp/fresh home/mods/$mod/$file"
  done
done
HERDR_APP_HOME="$tmp/fresh home" "$root/install.sh"

if command -v herdr-app >/dev/null 2>&1; then
  for mod in $mods; do
    HERDR_APP_HOME="$tmp/fresh home" herdr-app check "$tmp/fresh home/mods/$mod"
  done
fi

mkdir -p "$tmp/conflict/themes"
printf '%s\n' 'existing theme' > "$tmp/conflict/themes/night-owl.json"
if HERDR_APP_HOME="$tmp/conflict" "$root/install.sh"; then
  echo "expected a conflict" >&2
  exit 1
fi
test "$(cat "$tmp/conflict/themes/night-owl.json")" = 'existing theme'
test ! -e "$tmp/conflict/layouts/herdquarters.json"

mkdir -p "$tmp/mod-conflict/mods/compact-spaces"
if HERDR_APP_HOME="$tmp/mod-conflict" "$root/install.sh"; then
  echo "expected a mod directory conflict" >&2
  exit 1
fi
test ! -e "$tmp/mod-conflict/themes/night-owl.json"

echo "installation checks passed"

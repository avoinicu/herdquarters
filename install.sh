#!/bin/sh
# Install the layout, its mods, and the Night Owl theme.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"

for mod in compact-spaces compact-agents compact-footer compact-tabs; do
  if { [ -e "$home/mods/$mod" ] || [ -L "$home/mods/$mod" ]; } && { [ ! -f "$home/mods/$mod/main.js" ] || [ ! -f "$home/mods/$mod/mod.json" ]; }; then
    echo "conflict: $home/mods/$mod already exists; nothing installed" >&2
    exit 1
  fi
done

files='themes/night-owl.json
layouts/herdquarters.json
layouts/herdquarters.svg
mods/compact-spaces/main.js
mods/compact-spaces/mod.json
mods/compact-agents/main.js
mods/compact-agents/mod.json
mods/compact-footer/main.js
mods/compact-footer/mod.json
mods/compact-tabs/main.js
mods/compact-tabs/mod.json'

for file in $files; do
  if { [ -e "$home/$file" ] || [ -L "$home/$file" ]; } && ! cmp -s "$here/$file" "$home/$file"; then
    echo "conflict: $home/$file differs; nothing installed" >&2
    exit 1
  fi
done

mkdir -p "$home/themes" "$home/layouts" "$home/mods/compact-spaces" "$home/mods/compact-agents" "$home/mods/compact-footer" "$home/mods/compact-tabs"
for file in $files; do
  if [ ! -e "$home/$file" ] && [ ! -L "$home/$file" ]; then
    cp -n "$here/$file" "$home/$file"
  fi
done
echo "installed herdquarters and night-owl; select herdquarters in Herdr"

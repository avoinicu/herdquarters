#!/bin/sh
# Install the layout, its mods, and the Night Owl theme.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"

mods='compact-spaces compact-agents compact-footer compact-tabs
compact-menu compact-new-menu compact-worktree compact-machine-add
compact-prompt compact-confirm'

for mod in $mods; do
  if { [ -e "$home/mods/$mod" ] || [ -L "$home/mods/$mod" ]; } && { [ ! -f "$home/mods/$mod/main.js" ] || [ ! -f "$home/mods/$mod/mod.json" ]; }; then
    echo "conflict: $home/mods/$mod already exists; nothing installed" >&2
    exit 1
  fi
done

files='themes/night-owl.json
layouts/herdquarters.json
layouts/herdquarters.svg'

for mod in $mods; do
  files="$files
mods/$mod/main.js
mods/$mod/mod.json"
done

for file in $files; do
  if { [ -e "$home/$file" ] || [ -L "$home/$file" ]; } && ! cmp -s "$here/$file" "$home/$file"; then
    echo "conflict: $home/$file differs; nothing installed" >&2
    exit 1
  fi
done

mkdir -p "$home/themes" "$home/layouts"
for mod in $mods; do mkdir -p "$home/mods/$mod"; done
for file in $files; do
  if [ ! -e "$home/$file" ] && [ ! -L "$home/$file" ]; then
    cp -n "$here/$file" "$home/$file"
  fi
done
echo "installed herdquarters and night-owl; select herdquarters in Herdr"

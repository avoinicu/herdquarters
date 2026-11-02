# herdquarters for Herdr

A compact Herdr layout with a Night Owl dark theme. Spaces and agents are shown without avatars or program icons. Sidebar rows and square, borderless tabs extend to the edges. Context menus, the new-tab menu, and the layout's prompts, dialogs, and confirmations are square, use the same chrome and border separators, and drop Herdr's rounded overlay frame. Panes have no outer padding, split gaps, or focused-border highlight.

![herdquarters layout](preview.png)

## Install

Requires the Herdr desktop app and its built-in mods. Tested with Herdr 0.1.11. The layout and custom mods were cloned from Herdr 0.1.9, 0.1.10, and 0.1.11 and do not automatically receive upstream changes.

Read the [official Herdr guide](https://herdr.dev/guide/) and your installed `~/.config/herdr-app/AGENTS.md` first. Before installing, review [RECIPE.md](RECIPE.md) and the files. The spaces, menu, and worktree mods run Git queries, including on connected remote machines; the worktree dialog also runs `git worktree add` and `git worktree remove`. The machine dialog reads `~/.ssh/config` and runs `hc machine add`. The spaces mod runs `hc machine ls` and watches local Git folders. The custom mods do not call `fetch`.

Run `./install.sh`, check each installed mod, then select `herdquarters` in Herdr:

```sh
for mod in compact-spaces compact-agents compact-footer compact-tabs compact-menu compact-new-menu compact-worktree compact-machine-add compact-prompt compact-confirm; do
  herdr-app check "${HERDR_APP_HOME:-$HOME/.config/herdr-app}/mods/$mod" || exit 1
done
herdr-app do layout.switch '{"name":"herdquarters"}'
```

The installer does not switch layouts or overwrite files. If an installed file differs, it stops before copying anything. Resolve name clashes by renaming the new layout or mod and all its references, as the official guide describes. Set `HERDR_APP_HOME` to install to a different Herdr home. The files in this folder are separate from your installed copies, so later edits here do not automatically change the running app. The recipe and repository preview are not installed.

The layout follows Herdr's appearance setting: Night Owl in dark mode, Paper in light mode. The Night Owl terminal colors come from the [Night Owl theme](https://github.com/sdras/night-owl-vscode-theme).

## Files and behavior

- `layouts/herdquarters.json` defines the layout. `layouts/herdquarters.svg` is an illustration used in Herdr's layout picker.
- `mods/compact-spaces`, `mods/compact-agents`, `mods/compact-footer`, and `mods/compact-tabs` are customized copies of Herdr's spaces, agents, workspace-chrome, and tabs mods. Other panels and icons come from Herdr's built-in mods.
- `mods/compact-menu`, `mods/compact-new-menu`, `mods/compact-worktree`, `mods/compact-machine-add`, `mods/compact-prompt`, and `mods/compact-confirm` are copies of Herdr's menu, new-menu, worktree, machine-add, prompt, and confirm mods that draw square overlays with `frame: "none"`. The layout's `terminal_menu` points at `compact-menu`, so terminal right-click menus use it too.
- `themes/night-owl.json` defines the theme.

The six overlay mods style menus, dialogs, prompts, and confirmations opened by this layout. Herdr-owned screens, including Settings, the command palette, help, welcome, toasts, and terminal peek, keep their built-in rounded frame.

The spaces, menu, and worktree mods run read-only Git status and repository queries, including on connected remote machines, and the worktree dialog adds and removes worktrees. The machine dialog reads `~/.ssh/config` and runs `hc machine add`. The spaces mod watches local Git directories for changes. The mods keep their own state in Herdr; personal spaces, terminal output, and settings are not included here.

Run `python3 tests/layout.py` to check the layout references, terminal menu, theme, recipe structure, overlay mod manifests, and preview metadata. Run `tests/install.sh` to check installation and conflict handling without changing your Herdr home. If `herdr-app` is available, the test also checks the installed mods. Before publishing changes, run `gitleaks dir . --redact` and review images for personal content.

This repository follows [Herdr's layout sharing format](https://herdr.dev/layouts/): a named layout, its custom mods, a recipe, and a preview. It does not include personal settings, saved layout clicks, or runtime state. See [THIRD_PARTY.md](THIRD_PARTY.md) for the upstream code and theme licenses.

// Modified from Herdr's new-menu mod for herdquarters: square, edge-to-edge
// rows in the sidebar's chrome.
import { View, div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { theme, spaces, panes, knownAgents, run, openOverlay, closeOverlay, props, window, keys } from "herdr";

function shortcut(name) {
  const k = keys().find(b => b.section === "global" && b.action === name);
  if (!k?.keys.trim()) return "";
  const mac = window()?.platform === "macos";
  const names = mac ? { ctrl: "⌃", alt: "⌥", shift: "⇧", cmd: "⌘", fn: "fn" } : { ctrl: "Ctrl", alt: "Alt", shift: "Shift", cmd: "Super", fn: "Fn" };
  const alias = { secondary: mac ? "cmd" : "ctrl", super: "cmd", win: "cmd" };
  return k.keys.trim().split(/\s+/).map(stroke => {
    const parts = stroke.split("-");
    let key = parts.pop();
    if (key === "") { key = "-"; parts.pop(); }
    const held = new Set(parts.map(m => alias[m.toLowerCase()] ?? m.toLowerCase()));
    if (/^[A-Z]$/.test(key)) held.add("shift");
    const label = key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1).toLowerCase();
    return [...Object.keys(names).filter(m => held.has(m)).map(m => names[m]), label].join(mac ? "" : "+");
  }).join(" ");
}

const listHeight = (n) => Math.min(300, Math.max(1, n) * 31 + 6);

export default class NewMenu extends View {
  init(_props, cx) {
    this.agents = [];
    this.failed = false;
    this.loaded = false;
    this.handle = cx.focus_handle();
    this.handle.focus();
    cx.spawn(async cx => {
      try { this.agents = await knownAgents({ on: spaces().find(s => s.active)?.machine }); }
      catch { this.failed = true; }
      this.loaded = true;
      cx.notify();
    });
  }
  row(id, icon, name, action, hint = "", enabled = true) {
    const t = theme();
    return h_flex().id(id).h(31).w_full().px(12).gap(10).items_center().flex_none()
      .text_color(enabled ? t.foreground : t.dim).when(enabled, el => el.hover(s => s.bg(t.hover)))
      .on_click(() => { if (enabled) { closeOverlay(props().overlay); action(); } })
      .child(icon).child(div().flex_1().truncate().child(name)).child(div().text_size(11).text_color(t.dim).child(hint));
  }
  render() {
    const t = theme();
    const space = spaces().find(s => s.active);
    const installed = this.agents.filter(a => a.installed);
    const choices = [...installed, ...this.agents.filter(a => !a.installed).slice(0, 2)];
    return v_flex().w_full()
      .bg(t.chrome).border(1).border_color(t.border).text_size(12.8)
      .id("new-menu").track_focus(this.handle)
      .on_key_down((e) => {
        if (e.modifiers.control || e.modifiers.platform || e.modifiers.alt) return;
        const agent = /^[1-9]$/.test(e.key) ? installed[Number(e.key) - 1] : null;
        if (!agent) return;
        closeOverlay(props().overlay);
        run("tab.new", { name: agent.name, space: space?.id, argv: agent.run });
      })
      .child(this.row("terminal", svg("icons/shell.svg").size(14), "Terminal", () => run("tab.new", { space: space?.id }), shortcut("tab.new")))
      .child(div().h(31).flex_none().px(12).flex().items_center().text_size(11).text_color(t.dim).child("Start an agent"))
      .child(v_flex().flex_none().h(choices.length ? listHeight(choices.length) : 31).min_h(0).overflow_y_scrollbar().pb(6)
        .children(choices.length ? choices.map((a, i) => this.row(a.key, a.tint ? svg(a.icon).size(14).text_color(t.foreground) : image(a.icon).size(14), a.name,
          () => run("tab.new", { name: a.name, space: space?.id, argv: a.run }), a.installed ? (i < 9 ? String(i + 1) : "") : "not installed", a.installed)) : [])
        .when(choices.length === 0, el => el.child(div().px(12).py(6).text_color(t.dim).child(this.failed ? "Could not load agents" : this.loaded ? "No agents installed" : "Checking installed agents…"))))
      .child(div().h(1).w_full().bg(t.border))
      .child(this.row("space", div().w(14).child("+"), "New space", () => run("space.new"), shortcut("space.new")))
      .child(this.row("worktree", svg("mods/workspace-chrome/branch.svg").size(14), "New worktree…", () => openOverlay({ mod: "compact-worktree", kind: "dialog", frame: "none", width: 460, height: 280, props: { space: space?.id, folder: panes().find(p => p.focused)?.cwd, action: "new" } }), "", Boolean(space)))
      .child(this.row("worktree-open", svg("mods/workspace-chrome/branch.svg").size(14), "Open worktree…", () => openOverlay({ mod: "compact-worktree", kind: "dialog", frame: "none", width: 560, height: 480, props: { space: space?.id, folder: panes().find(p => p.focused)?.cwd, action: "open" } }), "", Boolean(space)));
  }
}

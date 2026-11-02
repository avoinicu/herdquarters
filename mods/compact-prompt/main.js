// Modified from Herdr's prompt mod for herdquarters: a square, chrome-coloured
// rename dialog with a tab-bar header.
// A text prompt. Enter saves, Esc cancels.
import { View, div } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { run, props, closeOverlay, theme } from "herdr";

export default class Prompt extends View {
  init(_props, cx) {
    this.text = props()?.value ?? "";
    this.input = InputState.new({ value: this.text });
    if (this.text) this.input.set_selected_range({ start: 0, end: this.text.length });
    this.input.on("change", (_e, cx) => { this.text = this.input.value(); cx.notify(); });
    this.input.on("submit", () => this.submit());
    this.inputFocused = true;
    this.input.on("focus", (_e, cx) => { this.inputFocused = true; cx.notify(); });
    this.input.on("blur", (_e, cx) => { this.inputFocused = false; cx.notify(); });
    this.input.focus();
    cx.timer.after(600, () => this.input.focus());
    this.handle = cx.focus_handle();
  }

  submit() {
    const p = props();
    closeOverlay(p.overlay);
    run(p.command.name, { ...(p.command.args ?? {}), name: this.text });
  }

  key(e, cx) {
    if (e.key === "escape") { closeOverlay(props().overlay); cx.stop_propagation(); }
  }

  render() {
    const t = theme();
    const p = props() ?? {};
    const button = (id, text, primary, action) => h_flex().id(id).h(28).px(12).items_center()
      .border(1).border_color(primary ? t.solid : t.input).bg(primary ? t.solid : t.raised)
      .text_color(primary ? t.solid_foreground : t.foreground).text_size(12.5).font_medium().cursor_pointer()
      .hover(s => s.opacity(0.88)).on_click(action).child(text);
    return v_flex().id("prompt").track_focus(this.handle).on_key_down((e, cx) => this.key(e, cx))
      .w_full().min_h(0).bg(t.chrome).border(1).border_color(t.border).text_color(t.foreground)
      .child(
        h_flex().h(31).flex_none().px(12).items_center().border_b(1).border_color(t.border)
          .child(div().flex_1().text_size(12.8).font_semibold().child((p.title ?? "").replace(/^./, (c) => c.toUpperCase())))
          .child(div().text_size(11).text_color(t.dim).child("Esc")),
      )
      .child(
        v_flex().flex_1().min_h(0).p(12)
          .when(Boolean(p.text), el => el.child(div().pb(8).text_size(12.5).text_color(t.muted).child(p.text)))
          .child(div().pb(6).text_size(11.5).text_color(t.dim).child("Name"))
          .child(Input.new(this.input).h(30).px(10).border(1).border_color(this.inputFocused ? t.accent : t.input).bg(t.background).text_size(12.8).text_color(t.foreground))
          .when(Boolean(p.hint), el => el.child(div().pt(6).text_size(11.5).text_color(t.dim).child(p.hint)))
          .child(h_flex().pt(12).gap(8).justify_end()
            .child(button("pm-cancel", "Cancel", false, () => closeOverlay(p.overlay)))
            .child(button("pm-save", "Save", true, () => this.submit()))),
      );
  }
}

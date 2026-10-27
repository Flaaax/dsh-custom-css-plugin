window.__ModuleLoader__.load({ id: "dsh-minimal-custom-style-plugin", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/client/StyleSection.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var sectionStyle = { display: "flex", flexDirection: "column", gap: 14, padding: "4px 2px 24px" };
var rowStyle = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
var labelStyle = { fontWeight: 600 };
var buttonStyle = { padding: "7px 12px", borderRadius: 8, border: "1px solid currentColor", cursor: "pointer" };
function StyleSection({ view, useStyleState, controller, t }) {
  const state = useStyleState((value) => value);
  const snapshot = state.snapshot;
  if (view === "summary") {
    const summary = snapshot === void 0 ? t("title") : `${snapshot.enabled ? t("enabledState") : t("disabledState")} \xB7 ${snapshot.bytes} ${t("bytes")}`;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.8 }, children: summary });
  }
  const confirmReload = () => {
    if (!state.dirty || globalThis.confirm(t("reloadConfirm"))) void controller.reload(true);
  };
  const confirmReset = () => {
    if (globalThis.confirm(t("resetConfirm"))) void controller.reset();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { style: sectionStyle, "aria-labelledby": "minimal-custom-style-title", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { id: "minimal-custom-style-title", style: { margin: 0 }, children: t("title") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: 0, color: "var(--dsw-alias-label-secondary, #6b7280)" }, children: t("warning") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: rowStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "checkbox",
          checked: snapshot?.enabled === true,
          disabled: state.busy || snapshot === void 0,
          onChange: (event) => {
            void controller.setEnabled(event.currentTarget.checked);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: labelStyle, children: t("enable") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: labelStyle, children: t("path") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { readOnly: true, value: snapshot?.path ?? "", style: { fontFamily: "monospace", padding: 8, borderRadius: 6 } })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: labelStyle, children: t("editor") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "textarea",
        {
          value: state.draft,
          disabled: state.status === "loading",
          spellCheck: false,
          onChange: (event) => {
            controller.setDraft(event.currentTarget.value);
          },
          style: { minHeight: 320, resize: "vertical", padding: 12, borderRadius: 8, fontFamily: "monospace", lineHeight: 1.5 }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: rowStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          style: buttonStyle,
          disabled: state.busy || snapshot === void 0 || !state.dirty,
          onClick: () => {
            void controller.save();
          },
          children: t("apply")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: buttonStyle, disabled: state.busy, onClick: confirmReload, children: t("reload") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: buttonStyle, disabled: state.busy || snapshot === void 0, onClick: confirmReset, children: t("reset") }),
      state.dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { role: "status", children: t("dirty") })
    ] }),
    snapshot !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
      snapshot.bytes,
      " ",
      t("bytes"),
      " \xB7 ",
      t("revision"),
      ": ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: snapshot.revision })
    ] }),
    state.notice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "p",
      {
        role: state.notice.tone === "error" ? "alert" : "status",
        style: { margin: 0, color: state.notice.tone === "error" ? "#c2410c" : void 0 },
        children: state.notice.text
      }
    )
  ] });
}

// src/client/locales.ts
var zh = {
  nav: "\u81EA\u5B9A\u4E49\u6837\u5F0F",
  title: "Custom CSS",
  enable: "\u542F\u7528\u81EA\u5B9A\u4E49 CSS",
  path: "CSS \u6587\u4EF6",
  editor: "CSS \u7F16\u8F91\u5668",
  apply: "\u5E94\u7528",
  reload: "\u91CD\u65B0\u8F7D\u5165\u6587\u4EF6",
  reset: "\u91CD\u7F6E\u4E3A\u7A7A\u767D\u6A21\u677F",
  warning: "\u53EA\u7C98\u8D34\u4F60\u81EA\u5DF1\u7F16\u5199\u6216\u5DF2\u7ECF\u5BA1\u8BA1\u8FC7\u7684 CSS\u3002CSS \u53EF\u4EE5\u9690\u85CF\u6216\u4F2A\u9020\u754C\u9762\uFF0C\u4E5F\u53EF\u80FD\u901A\u8FC7 url() / @import \u8BF7\u6C42\u5916\u90E8\u8D44\u6E90\u3002",
  dirty: "\u6709\u672A\u4FDD\u5B58\u8349\u7A3F",
  reloadConfirm: "\u91CD\u65B0\u8F7D\u5165\u4F1A\u4E22\u5F03\u5F53\u524D\u672A\u4FDD\u5B58\u8349\u7A3F\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F",
  resetConfirm: "\u786E\u5B9A\u628A CSS \u6587\u4EF6\u91CD\u7F6E\u4E3A\u7A7A\u767D\u5B89\u5168\u6A21\u677F\u5417\uFF1F\u6B64\u64CD\u4F5C\u4F1A\u8986\u76D6\u5F53\u524D\u6587\u4EF6\u3002",
  bytes: "\u5B57\u8282",
  revision: "revision",
  enabledState: "\u5DF2\u542F\u7528",
  disabledState: "\u5DF2\u7981\u7528"
};
var en = {
  nav: "Custom Style",
  title: "Custom CSS",
  enable: "Enable custom CSS",
  path: "CSS file",
  editor: "CSS editor",
  apply: "Apply",
  reload: "Reload file",
  reset: "Reset to blank template",
  warning: "Only paste CSS you wrote or audited. CSS can hide or spoof UI and may request external resources through url() or @import.",
  dirty: "Unsaved draft",
  reloadConfirm: "Reloading discards the unsaved draft. Continue?",
  resetConfirm: "Reset the CSS file to the blank safety template? This overwrites the current file.",
  bytes: "bytes",
  revision: "revision",
  enabledState: "Enabled",
  disabledState: "Disabled"
};

// src/client/state.ts
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");

// src/shared/protocol.ts
var PACKAGE_ID = "dsh-minimal-custom-style-plugin";
var ENTRY_ID = "minimal-custom-style";
var RPC_CHANNEL = "/minimal-custom-style";
var MAX_CSS_BYTES = 256 * 1024;

// src/client/state.ts
function isSnapshot(value) {
  if (typeof value !== "object" || value === null) return false;
  const row = value;
  return typeof row.enabled === "boolean" && typeof row.css === "string" && typeof row.path === "string" && typeof row.bytes === "number" && typeof row.revision === "string";
}
var StyleController = class {
  constructor(rpc, styles) {
    this.rpc = rpc;
    this.styles = styles;
  }
  rpc;
  styles;
  state = (0, import_dsh_client_store.createSnapshotStore)({
    status: "loading",
    draft: "",
    dirty: false,
    busy: false,
    notice: void 0
  });
  lifetime = new AbortController();
  disposed = false;
  async start() {
    await this.read(false, false);
  }
  setDraft(draft) {
    this.state.update((state) => {
      state.draft = draft;
      state.dirty = draft !== state.snapshot?.css;
      state.notice = void 0;
    });
  }
  async save() {
    const current = this.state.getSnapshot();
    if (current.busy || current.snapshot === void 0) return;
    await this.perform("save", { css: current.draft, revision: current.snapshot.revision }, true);
  }
  async setEnabled(enabled) {
    if (this.state.getSnapshot().busy) return;
    await this.perform("set-enabled", { enabled }, false);
  }
  async reload(discardDraft) {
    if (this.state.getSnapshot().dirty && !discardDraft) return;
    await this.read(true, true);
  }
  async reset() {
    const current = this.state.getSnapshot();
    if (current.busy || current.snapshot === void 0) return;
    await this.perform("reset", { revision: current.snapshot.revision, confirm: true }, true);
  }
  async refreshFromSettings(namespace) {
    if (namespace !== ENTRY_ID || this.state.getSnapshot().busy) return;
    await this.read(false, false);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.lifetime.abort(new DOMException("\u63D2\u4EF6\u5DF2\u5378\u8F7D", "AbortError"));
    this.styles.remove();
  }
  async read(replaceDraft, explicit) {
    if (this.disposed) return;
    this.state.update((state) => {
      state.busy = true;
      state.notice = void 0;
    });
    try {
      const result = await this.rpc.call(RPC_CHANNEL, explicit ? "reload" : "read", {}, this.lifetime.signal);
      if (this.disposed) return;
      if (!result.ok) throw new Error(result.error.message);
      this.accept(result.value, replaceDraft, explicit ? "\u5DF2\u91CD\u65B0\u8F7D\u5165 CSS \u6587\u4EF6\u3002" : void 0);
    } catch (error) {
      if (this.disposed) return;
      this.fail(error);
    }
  }
  async perform(endpoint, payload, replaceDraft) {
    this.state.update((state) => {
      state.busy = true;
      state.notice = void 0;
    });
    try {
      const result = await this.rpc.call(RPC_CHANNEL, endpoint, payload, this.lifetime.signal);
      if (this.disposed) return;
      if (!result.ok) throw new Error(result.error.message);
      this.accept(result.value, replaceDraft, endpoint === "save" ? "CSS \u5DF2\u4FDD\u5B58\u5E76\u5E94\u7528\u3002" : endpoint === "reset" ? "CSS \u5DF2\u91CD\u7F6E\u4E3A\u7A7A\u767D\u6A21\u677F\u3002" : void 0);
    } catch (error) {
      if (this.disposed) return;
      this.fail(error);
    }
  }
  accept(value, replaceDraft, success) {
    if (!isSnapshot(value)) throw new Error("Host \u8FD4\u56DE\u4E86\u65E0\u6548\u7684\u6837\u5F0F\u5FEB\u7167\u3002");
    this.styles.apply(value);
    this.state.update((state) => {
      const keepDraft = state.dirty && !replaceDraft;
      state.status = "ready";
      state.snapshot = value;
      state.draft = keepDraft ? state.draft : value.css;
      state.dirty = state.draft !== value.css;
      state.busy = false;
      state.notice = success === void 0 ? keepDraft ? { tone: "info", text: "\u6587\u4EF6\u72B6\u6001\u5DF2\u66F4\u65B0\uFF1B\u672A\u4FDD\u5B58\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002" } : void 0 : { tone: "success", text: success };
    });
  }
  fail(error) {
    const text = error instanceof Error ? error.message : String(error);
    this.state.update((state) => {
      state.status = state.snapshot === void 0 ? "error" : "ready";
      state.busy = false;
      state.notice = { tone: "error", text };
    });
  }
};

// src/client/style-owner.ts
var STYLE_SELECTOR = `style[data-plugin=${JSON.stringify(PACKAGE_ID)}][data-plugin-css=${JSON.stringify(`${PACKAGE_ID}/custom.css`)}]`;
var StyleOwner = class {
  apply(snapshot) {
    if (!snapshot.enabled) {
      this.remove();
      return;
    }
    let style = document.head.querySelector(STYLE_SELECTOR);
    if (style === null) {
      style = document.createElement("style");
      style.setAttribute("data-plugin", PACKAGE_ID);
      style.setAttribute("data-plugin-css", `${PACKAGE_ID}/custom.css`);
      document.head.append(style);
    }
    style.textContent = snapshot.css;
  }
  remove() {
    for (const style of document.head.querySelectorAll(STYLE_SELECTOR)) style.remove();
  }
};

// src/client/index.tsx
var name = "minimal-custom-style-client";
var inject = ["slots", "locale", "connection", "remote"];
function apply(ctx) {
  const locale = "settings.minimalCustomStyle";
  const connection = ctx.get("connection");
  const controller = new StyleController(connection.rpc, new StyleOwner());
  const t = ctx.locale.bind(locale);
  ctx.effect(() => ctx.locale.register(locale, { zh, en }), "minimal-custom-style: dictionaries");
  ctx.effect(() => {
    void controller.start();
    return () => {
      controller.dispose();
    };
  }, "minimal-custom-style: style lifecycle");
  ctx.effect(() => ctx.remote.$on("settings/document-updated", (namespace) => {
    void controller.refreshFromSettings(String(namespace));
  }), "minimal-custom-style: settings invalidation");
  const injectFace = () => ({
    hooks: { styleState: controller.state },
    controller,
    t
  });
  ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
    name: "plugins.bundle.config",
    key: PACKAGE_ID,
    inject: injectFace
  }, StyleSection));
}
return module.exports; } });
//# sourceMappingURL=client.js.map

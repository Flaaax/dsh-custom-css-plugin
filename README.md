# Custom CSS

A minimal, auditable custom CSS plugin for the DeepSeek Harness **Desktop** UI. Edit, save, reload, reset, and toggle custom CSS from the Desktop settings page. Built for DSH `0.2.1-rc.3` (current release `0.1.0`).

> **Security:** custom CSS can hide, mask, or spoof the interface, and `url()` / `@import` may trigger network requests. Only use CSS you wrote yourself or have already audited.

## Install

Install the published release from GitHub:

```powershell
dsh plugin --profile desktop add "https://github.com/Flaaax/dsh-custom-css-plugin.git#v0.1.0"
```

Restart the Desktop app afterwards. A "Custom CSS" section then appears in the settings page.

> This plugin declares the Desktop Web Client plane only. It is not a standalone Web/Headless product feature.

## Features

- Edit, save, reload, reset, and enable/disable CSS from the Desktop settings page.
- Persist CSS to `$DSH_HOME/dsh-minimal-custom-style/custom.css` (with the default DSH Home, usually `%USERPROFILE%\.dsh\dsh-minimal-custom-style\custom.css`).
- Atomic writes, a 256 KiB size cap, strict UTF-8 validation, and SHA-256 revision conflict protection.
- `/custom-style status|enable|disable|reload|reset confirm` commands.
- The CSS file is preserved when the plugin is disabled or removed.

Built-in CSS presets are tracked as future TODOs and are not part of `0.1.0`. Future presets will still write to the same `custom.css` instead of introducing a second persistent store.

## Usage

In the settings page, "Save & Apply" only applies content the Host has confirmed. If the file is edited externally, saving a stale draft is rejected by the revision check; use "Reload" and merge manually.

Commands:

```text
/custom-style status
/custom-style enable
/custom-style disable
/custom-style reload
/custom-style reset confirm
```

`reset` requires an explicit `confirm` and replaces the file with a safe blank template.

## Disable, recover, and uninstall

While the UI is still usable, turn the toggle off in the settings page, or run `/custom-style disable`. If bad CSS makes the UI unusable, fully exit the Desktop app and remove the plugin from the profile:

```powershell
dsh plugin --profile desktop remove dsh-minimal-custom-style-plugin
```

Removal does not delete `custom.css`. Fix the file and reinstall, or rename it to a backup first so the plugin recreates a fresh blank template. With the default DSH Home:

```powershell
$css = Join-Path $env:USERPROFILE '.dsh\dsh-minimal-custom-style\custom.css'
Copy-Item -LiteralPath $css -Destination "$css.backup" -Force
```

## Build from source

Requires a compatible Node.js `22.19.0+` and pnpm.

```powershell
pnpm install --frozen-lockfile
pnpm run verify
```

`verify` runs type checking, Host/Client builds, tests, and a publish-manifest preflight.

## Documentation

- [Architecture](docs/architecture.md) (中文)
- [Security invariants](docs/security.md) (中文)
- [Verification](docs/verification.md) (中文)
- [Roadmap / TODO](docs/roadmap.md) (中文)
- [References and version pinning](docs/references.md) (中文)

[中文文档](README.zh.md)

## License

[MIT](LICENSE) © Flaaax

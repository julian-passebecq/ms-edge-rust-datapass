# DataPass Edge Workspaces (V1)

Lightweight, open-source Microsoft Edge extension with an IDE-style sidebar for dev projects, saved conversations and active browser tabs. **Not a Chromium fork.**

## Install on Windows

1. Open a separate Edge profile for development if you want to isolate sessions. Back up any valuable AtlasNote IndexedDB data before changing browser profiles or origins.
2. Download this repository or clone it.
3. Open `edge://extensions`, switch on **Developer mode**, select **Load unpacked**, and choose the repository's **extension** directory.
4. Pin **DataPass Edge Workspaces** in the toolbar. Click its toolbar icon to open the side panel.
5. Use **+ Current tab** to save a URL in the selected workspace, **Capture window** to save eligible URLs, and **Open workspace** to reopen up to 8 entries at a time.

No npm installation is required for the Edge extension. It has **no runtime dependencies** and keeps only metadata in `chrome.storage.local`.

## Available in V1

- Project tree with editable workspaces, collapsible folders and draggable saved links
- Fast search across saved links and the current Edge window's open web tabs (`/` or `Ctrl+Shift+K`)
- Add link / add current tab / capture window / reopen saved links
- Local JSON backup export and validated import with explicit replacement confirmation
- Opt-in **Sleep inactive** using Edge's tab-discard API (excludes active, pinned and audible tabs)
- Automatic light/dark appearance; no telemetry, no content scripts, no remote requests
- Rust native host with a **ping-only** diagnostic, not started by default

**Important:** Tab-discard can lose unsaved form input. The counter displays *loaded and discarded tabs*, **not measured RAM bytes**.

## Rust Native Messaging bridge (optional)

Install Rust from https://rustup.rs/ first. In a PowerShell window at the repository root:

```powershell
cargo test --manifest-path bridge/Cargo.toml
cargo build --release --manifest-path bridge/Cargo.toml
.\scripts\install-native-host.ps1 -ExtensionId "YOUR_EDGE_EXTENSION_ID"
```

Get the 32-character extension ID from `edge://extensions`. The PowerShell installer registers the host under **HKCU**, not HKLM; it must be run deliberately. Then click **Rust bridge** in the sidebar, review the optional permission prompt and run its diagnostic.

The Rust executable supports **only `ping`**. There is no filesystem access, file upload, command execution or background daemon in V1.

## Tests

```powershell
npm test
npm run check
```

Node 22+ is recommended. Test files use the built-in Node test runner; no `npm install` is necessary. Rust tests require Cargo. Browser/Windows acceptance remains a separate manual verification (see [test plan](docs/TEST_PLAN.md)).

## Privacy, security and AtlasNote

The extension can read current browser tab titles/URLs because it declares `tabs`, but **does not read ChatGPT message bodies, cookies, page text, local files or AtlasNote IndexedDB**. Saved links are explicit; `Capture window` is user-triggered. Exported JSON contains browsing metadata: treat it as private.

Only `http://` and `https://` URLs without embedded credentials are saved. Selected sensitive query keys are removed. There are no `host_permissions`.

AtlasNote stays a separate browser app; its data is origin/profile-scoped. Saving an AtlasNote link does **not** back up its content. Use AtlasNote's own verified recovery bundle before profile/origin changes.

**Out of scope for V1:** automated ChatGPT uploads, local Gemma, tab content scraping, process-level RAM readings, Edge profile administration and background agents. These require independent user gates and tests.

MIT-licensed. See [architecture](docs/ARCHITECTURE.md).

## Personal Dashboard — V0.2 candidate

Open the original Edge sidebar and click **◫ Dashboard**. This opens a separate Edge extension tab without changing your default new-tab page.

### Included
- Modular 3-column card grid, compact theme views, keyboard move buttons, drag ordering, width 1/2/3, hide/restore catalog, and local persistence.
- News: Norwegian Data/IT (Digi.no, TU and kode24 searches), BBC World, BFM TV, BFM Business, CNN, F1, Netflix/Tudum, Jeuxvideo.com tests.
- Manchester City: official fixtures shortcut, local ICS import with conservative UTC parsing, upcoming events in Oslo time, and optional current-news search.
- The Mentalist: editable personal episode favorites; verified starter S05E20 Red Velvet Cupcakes.
- Yahoo Finance: editable ticker shortcuts, no fake market prices.
- Gmail: inbox/compose links, no email reading.
- GitHub: repository shortcuts independent of the conversation tree, optional latest public Actions status.
- IT quotas: Cloudflare Workers/R2, GitHub Actions, Netlify and MongoDB official billing/usage shortcuts. Usage shown as **not connected**, never a fabricated number.
- Left conversation navigator: saved ChatGPT and Claude URLs grouped by existing Edge workspace plus open conversation tabs; no message scraping.
- New ChatGPT/Claude tabs and a MongoDB Atlas console shortcut (does **not** create a database).

### How public feeds work
Click **Actualiser le flux** on a news card. Edge will request a limited optional host permission for either feeds.bbci.co.uk (original BBC RSS) or news.google.com (search RSS aggregated from selected publications). If the permission is denied, the source times out or there are no recent items, the card explains the failure and still links to the publisher. There is no background feed polling. Public GitHub status uses an optional api.github.com grant on demand.

### Local preferences and profiles
The dashboard uses chrome.storage.local under a new versioned key. It reads the V1 saved workspace URL metadata without changing the original schema. It does not read any ChatGPT/Claude conversation text, Gmail messages or AtlasNote IndexedDB. This is **not** a replacement for AtlasNote recovery bundles. Dashboard settings are per Edge profile.

### Verify
    npm test
    npm run check
    cargo test --manifest-path bridge/Cargo.toml

Read [dashboard test plan](docs/dashboard/TEST_DASHBOARD.md), [feature acceptance](docs/dashboard/features.csv), [UX matrix](docs/dashboard/ux.csv) and [contract](docs/dashboard/CONTRACT.md). CI alone does not prove Windows Edge runtime behavior.

### Boundaries / future integrations
No OAuth credentials are stored or extracted. Gmail unread counts, exact personal free-tier usage, automatic City calendar subscriptions, local Gemma and browser agents need their own owner-authorized connectors and validation before showing real live data.

### Ma veille en un clic
En haut du dashboard, **↻ Mes actualités** actualise uniquement les flux des cartes visibles du thème actif. Un clic demande les permissions limitées aux deux domaines publics pertinents, puis interroge au plus trois flux en parallèle, sans surveillance de fond. Les cartes qui échouent restent cliquables vers leurs sources.

The Mentalist includes four **subjective starter suggestions**, not a canonical funniest-episodes ranking (S05E20, S02E19, S02E06, S01E17), each individually removable.

## Personal Cockpit V0.3 candidate — Matin / Deep Work / Soir

This increment is developed on `feat/personal-command-center-v2`, stacked on the draft personal-dashboard PR. It **does not** fork Edge, move AtlasNote's database, or require any resident agent.

### Mode selector
Above the widget grid, select **Mes cartes**, **Matin**, **Deep Work**, or **Soir**. Every mode has its own saved card order, visibility, width and reset. **Mes cartes** preserves the exact custom layout from V0.2. New installations open Deep Work; existing V0.2 stored profiles continue in Mes cartes until you choose a mode.

- **Matin:** My Attention, norsk, Norwegian data/IT and BBC news, Manchester City, F1, Gmail, quick launch.
- **Deep Work:** Resume My Work, Galaxy Pulse, My PC, My Attention, repos/CI and quota links, R&D Discovery, tech news.
- **Soir:** Manchester City, F1, Netflix, The Mentalist and games.
All cards remain removable, restorable and sortable in each mode.

### Resume My Work
Only existing Edge tab metadata and explicitly saved workspace URLs are shown. The extra **Derniers onglets fermés** button requests the optional **sessions** permission only when clicked; closed-tab metadata is not persisted. You can restore an eligible recently closed tab with one click. No ChatGPT/Claude message text, cookies or full browsing history is read. Native Codex and Claude Code terminal sessions are **not connected**.

### Galaxy Pulse / My Attention
Click **Lire les CI publiques** to grant the existing optional GitHub public API permission and inspect the most recent public Actions workflow for Agent, DiagramCloud, MosaicStudio, AtlasNote, Visual Gallery and Edge Browser (plus selected public repos). The app displays only the observed run result, exact SHA, source link and time of query. Private PM, Brain and Galaxy Hub remain **UNKNOWN/private**; Factory remains a GitLab link with **UNKNOWN CI**. An observed green workflow does not prove the released product is complete. The Attention card summarizes only observed failures/pending runs; empty data is UNKNOWN, not all green.

### Mon PC — optional Rust diagnostics
Build/reinstall the bridge from this branch and click **Lire mon PC**. Edge requests **nativeMessaging** permission directly from your click. Rust `system_snapshot` returns a one-time, read-only CPU sample, RAM used/available, approximate Edge/Ollama/Docker/Node process RSS and anonymous volume free-space values. There is no background sampling, local file read, shell command or network upload. A detected Ollama process does not prove a model is loaded.

From a PowerShell terminal at repository root (after Rust installation):
```powershell
cargo test --manifest-path bridge/Cargo.toml
cargo build --release --manifest-path bridge/Cargo.toml
.\scripts\install-native-host.ps1 -ExtensionId "YOUR_REAL_EDGE_EXTENSION_ID"
```
Get the ID from `edge://extensions` in your dedicated development profile. If you already registered the earlier ping-only native host, rebuild the binary and run the installer again. The host is started per request and then exits; no service installation is necessary.

### Technical tests
```powershell
npm test
npm run check
cargo test --manifest-path bridge/Cargo.toml
```
For acceptance and manual Windows Edge gates, see [V0.3 contract](docs/cockpit/CONTRACTS.md), [QA](docs/cockpit/TEST_PLAN.md), [resume](docs/cockpit/RESUME.md) and the extended [feature matrix](docs/dashboard/features.csv).

**Privacy:** recently closed tabs and Native Messaging are separately optional. Nothing in this increment sends browser history or Windows metrics to external servers. The existing user-triggered public news and GitHub API requests remain opt-in. Windows RAM/CPU benchmarks are not available from this remote ChatGPT.com session.

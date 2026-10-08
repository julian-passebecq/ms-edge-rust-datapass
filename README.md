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

# Architecture and scope

## Truth and ownership

- Browser engine and Windows profiles: Microsoft Edge.
- UI surface: Edge extension Manifest V3 `sidePanel` (no custom Chromium build).
- Storage: `chrome.storage.local`, key `datapass.edge.workspaces.v1`, schemaVersion 1.
- Native integration: opt-in Rust process launched by Native Messaging; currently **ping only**.
- AtlasNote: standalone browser app, not embedded or modified.

## Data contract

```json
{
  "schemaVersion": 1,
  "activeProjectId": "galaxy",
  "projects": [
    { "id": "galaxy", "name": "Galaxy", "collapsed": false, "links": [] }
  ]
}
```

A saved link has `id`, `title`, `url` and `createdAt`. Limits: 30 workspaces and 150 links each. State normalization rejects dangerous URL schemes, URL credentials, invalid projects and duplicates. Known token-like query keys are excluded from stored URLs.

A workspace is a collection of **links**, not a copy of tab memory, browser session cookies or page content. Restoring opens at most eight links, only on user request. The `open tabs` list is live only while the panel is running.

## Boundaries

- Required permissions: `tabs`, `storage`, `sidePanel`.
- Optional permission: `nativeMessaging`, requested on explicit action.
- No host permissions, content injection, external network fetches or extension-side remote code.
- Rust host manifest allowlists exactly one user-provided extension ID.
- Native host accepts one operation: `ping`. Other operations return `unsupported_operation`.
- No background agent, and no polling when the extension side panel is closed.
- JSON backups are private and contain link metadata. They are **not** AtlasNote recovery backups.

## Future qualified phases (not implemented)

1. Benchmark Edge RAM/CPU with 5, 15 and 30 ChatGPT/X/GitHub tabs (Edge Task Manager, repeatable baseline).
2. User-selected local file staging via Rust: allowlisted directories, canonical path checks, size caps and per-action confirmations.
3. Optional UI-driven upload automation with Playwright, sandboxed profile and user approval before sending.
4. Optional on-demand local embedding/function-call model if memory budget justifies it; no always-on inference.
5. Versioned AtlasNote import/export integration, strictly separate from AtlasNote IndexedDB.

Live browser behavior and Windows installer operation must be tested on Windows/Edge before V1 is marked fully qualified.

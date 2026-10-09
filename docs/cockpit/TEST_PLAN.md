# Cockpit V0.3 acceptance - exact-head gates

## Automated
1. `npm test`: legacy V1 and V0.2 tests unchanged in coverage plus cockpit tests for migration, independent layouts, reset, reorder, Resume host-filter/dedup, sessions filter, Pulse private state and Attention classification.
2. `npm run check`: `node --check` all extension JS; Manifest V3 required perms unchanged; optional sessions/nativeMessaging + limited three remote origins; dashboard IDs and CSS references valid.
3. `cargo test --manifest-path bridge/Cargo.toml`: ping preserved; all arbitrary file/process operations rejected; system_snapshot outputs allowlisted keys and a bounded process list. CI Linux build proves only cross-platform compile, not Windows host operation.
4. Verify exact commit SHA, run ID, conclusion and job/step statuses, no CI green inferred from an earlier commit.

## Windows / Edge owner journey (not observed by ChatGPT.com)
1. Back up AtlasNote first if testing a new Edge profile. Load unpacked `extension/` in Edge from the selected branch. Confirm sidebar and dashboard open.
2. If migrating V0.2, verify custom card order, widths, hidden cards, saved workspaces, episode list and calendars survive. Do not clear storage.
3. Select Matin, Deep Work and Soir. Hide/resize/reorder a widget in one mode, switch back and forth and reload. Confirm other modes and Mes cartes unchanged.
4. In Deep Work, use Resume My Work for an existing ChatGPT/Claude/GitHub tab and a saved conversation. Check only URLs/titles appear, no message body.
5. Click Recently closed; grant the optional sessions permission, close a disposable eligible tab then restore it. Revoke permission and confirm graceful fallback. No use of private browsing history.
6. Click Galaxy Pulse public GitHub CI: validate SHA, run URL and source timestamp. Confirm PM and Brain remain UNKNOWN/private, Factory UNKNOWN/GitLab. Verify Attention with a known public failure/pending if available, never display false all-clear.
7. Build Rust release on Windows and register the actual Edge extension ID via the existing installer, then click Read my PC and grant nativeMessaging. Compare RAM and CPU to Windows Task Manager; check approximate Edge RSS, Docker/Ollama process observations and disk free space. Ensure missing host or permission denial shows unavailable.
8. Confirm no Rust process persists between clicks; no background polling or remote exfiltration. Confirm no arbitrary host op supports commands or file reads.
9. Test 5/15/30 open tabs for Edge RAM, battery/CPU while dashboard is open and closed; record measured bytes. Do not treat process RSS sum as an exact browser-memory total.
10. Repeat baseline V0.2 path: feeds, Manchester City ICS, Mentalist favorites, GitHub shortcuts and JSON workspace export.

Status: implementation candidate until these Windows observations and owner review.

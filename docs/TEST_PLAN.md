# Acceptance / manual Windows test plan

## Static and unit verification
- Run `npm test`, `npm run check` from the repository root.
- Run `cargo test --manifest-path bridge/Cargo.toml` with Rust installed.
- Review MV3 permissions, import graph and absence of host permissions.

## Browser / UX (requires Microsoft Edge)
1. Install unpacked `extension/` in a **new dedicated Edge profile**; verify action icon opens the native side panel.
2. Open ChatGPT, GitHub, X and your AtlasNote deployment as separate tabs. Confirm the Open Tabs list, active highlight and search.
3. Create a Galaxy test workspace, save two conversation URLs, rename and reorder both links, reload the extension and confirm persistence.
4. Capture the window. Re-run Capture and verify URLs are deduplicated.
5. Export the JSON, remove a test link, import with confirmation, verify restoration. Verify schemaVersion 2 import is rejected.
6. Test the 'Open workspace' button; ensure no more than eight links open and existing matching tabs are reused.
7. On **disposable tabs without unsaved data**, test Sleep inactive. Confirm pinned, audible and active tabs are excluded; discarded count updates.
8. Run Rust release build, register the host with the actual unpacked extension ID and click Rust bridge. Confirm a successful ping; verify missing-host failure is clear.
9. Open AtlasNote, read PDFs and verify its data remains intact; do not switch origins/profiles with valuable unsaved IndexedDB data.

## RAM comparison
Use Windows Task Manager and Edge's built-in Browser Task Manager. Repeat with 5, 15 and 30 representative tabs in identical profiles after cold restart. Record:
- Edge total process resident memory and CPU at idle
- loaded versus discarded counts
- switching/reload latency
- peak memory during optional native ping

Do not claim the extension measures RAM; only the OS and browser tools provide that evidence.

## Required before production declaration
- No data loss after restore/import/Edge restart.
- Extension can run with only standard permissions; Rust is optional.
- No automatic file uploads, content scraping or hidden network transfers.
- Known limitation: no Windows/Edge browser and Rust runtime qualification has been performed from this chat environment.

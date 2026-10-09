# Dashboard release gates

## CI and deterministic tests
- `npm test` covers widget schema/defaults, labels and domains, layout save/hide/reorder, identifiers, ICS UTC and IANA TZID conversion and ChatGPT/Claude grouping.
- `npm run check` checks all JS syntax, Manifest V3, optional host allowlist, and dashboard HTML targets.
- `cargo test --manifest-path bridge/Cargo.toml` confirms V1 bridge ping-only remains valid.
- CI must be green at the latest exact branch SHA; older V1 CI is historical only.

## Windows + Edge journey (required; NOT measured by this remote chat)
1. Load the `extension` directory in a dedicated Edge profile.
2. Open sidebar → Dashboard. Confirm 3 columns at desktop, responsive stacking, visual legibility.
3. Hide CNN and Gmail cards, resize Tech Norway, reorder with buttons/drag and reload. Confirm persistence and ability to restore.
4. Switch between Tout / Actualités / Loisirs / Développement.
5. Click BBC World refresh; approve only feeds.bbci.co.uk. Confirm headlines are timestamped; click article and verify source. Deny Google News and verify publisher fallback still works.
6. Click feeds for Norwegian IT, BFM/CNN, Netflix and Jeuxvideo.com. Record whether Google News RSS is permitted and whether timestamps are fresh; failure is explicit, not empty fake news.
7. Import a known official Manchester City UTC/TZID `.ics` file and compare kickoffs in Europe/Oslo to publisher. Confirm DST-ambiguous or unqualified floating times are rejected and all-day entries have no invented kickoff time.
8. Add a Mentalist episode, Yahoo ticker and GitHub repo; reload.
9. Check latest public repo run with optional API permission; verify repo SHA/status and no account quota claim.
10. Open new ChatGPT and Claude tabs, save a live conversation from left rail and confirm it appears under current workspace. Verify no message body/network scraping.
11. Open Gmail, Yahoo and Mongo Atlas shortcuts; confirm they open URLs without access token/cookie extraction or unintended DB writes.
12. With valuable AtlasNote data, follow its own recovery backup procedure before testing alternate profile or origin.
13. Benchmark startup/RAM with 5, 15, 30 open tabs. Record Edge Browser Task Manager and Windows Task Manager actual usage; extension counter is not RAM.

Status source implementation only until these checks are observed on Windows.

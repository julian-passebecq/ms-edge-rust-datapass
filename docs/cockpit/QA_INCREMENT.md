# V0.3 QA scope extension - 2026-10-10

Incremental qualification, not a second architecture or roadmap.

- `scripts/native-host-smoke.mjs`: exercises the real Native Messaging binary with three length-prefixed stdio frames: ping, one-shot sanitized system snapshot, and a rejected arbitrary command. Asserts clean exit and exact allowed response fields. No registration, cookies or credentials needed.
- `scripts/browser-smoke.mjs`: launches a fresh isolated Playwright Chromium profile with the unpacked extension, checks modes, independent hide/persistence, Manager restore, synthetic GitHub Resume entry and a narrow/mobile layout. Screenshots contain **synthetic-only** local test data, never real sessions or user assets.
- `.github/workflows/ci.yml`: retains original Linux Node/Rust gates, adds Linux host binary protocol check, a Windows GitHub-hosted Node/Rust + protocol job, and a branch-limited synthetic Chromium screenshot job. The browser job is conditional on PR #3 head branch to avoid broad repeat execution in unrelated repos.
- Browser screenshots are retained in GitHub Actions artifacts for 7 days. These are visual samples and **cannot** be treated as direct owner's Windows Edge qualification. Any differences must be verified in the user's actual Edge profile.
- Windows GitHub runner and Edge on the owner's own PC are separate trust/runtime environments. A Windows runner may prove native process launch and stdio protocol, but **not** local registry/profile integration.
- No extension permissions added by this test increment; no paid service or new background polling.

Final verdict pending exact-head GitHub CI and native Windows/Edge user journey. Use `docs/cockpit/HANDOFF_CODEX_WINDOWS.md` for execution instructions.

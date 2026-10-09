# Native Windows / Edge qualification handoff

TARGET=CODEX
SOURCE_SURFACE=CHATGPT.COM
REPO=julian-passebecq/ms-edge-rust-datapass
TARGET_BRANCH=feat/personal-command-center-v2
TARGET_PR=https://github.com/julian-passebecq/ms-edge-rust-datapass/pull/3
PARENT_BASE=feat/personal-dashboard-v1 @ 53ba42e11d64f752439291947a14ad2ceeee8659
PR_CHAIN=#1 sidebar -> #2 personal dashboard -> #3 V0.3 cockpit
CURRENT_BRANCH_SHA=VERIFY LIVE BEFORE CHECKOUT; DO NOT SUBSTITUTE AN OLD SHA
DATE=2026-10-10
OWNER_SELECTION=Qualify actual Edge Windows visual layout, modes, local Resume and Rust one-shot diagnostics. Work on implementation bugs only if reproduced with evidence.
NON_GOALS=No merge, deployment, automatic push, unattended authenticated UI scraping, user profile reset, external API credential extraction, or product agent orchestration.

## Read the minimum source and recover local state

1. Read Galaxy current rules through `galaxy-hub/START.md` and `sources.json`, then `galaxy-knowledge-csv/PROJECT_INSTRUCTIONS.md`.
2. Read this repository's `docs/cockpit/START.md`, `CONTRACTS.md`, `TEST_PLAN.md`, `RESUME.md` and only impacted `docs/dashboard/features.csv`, `ux.csv` rows EDGE-DASH-026..038 / EDGE-UX-013..021.
3. Discover the *actual* local checkout under `D:\PROJ` instead of assuming a path. Record the real worktree path, `git status --short --branch`, `git rev-parse HEAD`, current writers and existing native Codex sessions. Never reset, delete or overwrite a dirty worktree.
4. Fetch current PR #3 head and exact CI via GitHub. Work in an isolated clean worktree if an owner-approved writer reservation is available; otherwise stop and report collision rather than overwriting another process.

## Evidence available before Windows work

- The earlier implementation head `1b2f991be830ac1e37c61a344124e319f1594b3c` passed Linux GitHub CI run 37939868743 (22 Node unit tests, 4 Rust unit tests). This does not prove Windows GUI or Native Messaging.
- The current PR adds Node native protocol framing tests and a synthetic Chromium screenshot workflow, plus a Windows runner job. These CI results must be read at the new exact SHA, not assumed PASS from this handoff.
- CI test screenshots are **synthetic only**. They cannot prove the owner's Edge browser state or interactions with authenticated services.

## Qualification sequence

A. **Preflight without user profile changes.**
- Confirm Windows version, Edge version, Node, Rust/Cargo, PowerShell and optional Playwright/Edge GUI automation capabilities. Do not install paid services.
- Confirm original AtlasNote IndexedDB origin/profile and recovery status. Never clear site storage or move the app to a new origin.
- If Edge GUI automation is not available to Codex, run only qualified CLI, screenshots and test harness in an isolated Edge test profile, then clearly identify manual owner visual checks still necessary.

B. **Run deterministic repo gates at exact branch SHA.**
```powershell
npm test
npm run check
cargo test --manifest-path bridge/Cargo.toml
cargo build --release --manifest-path bridge/Cargo.toml
node scripts/native-host-smoke.mjs
```
Inspect the new GitHub Windows runner and synthetic-browser screenshots separately. Do not mark on-host Windows PASSED just because the hosted Windows runner passed.

C. **Actual Edge experience — disposable, isolated profile.**
- Open `edge://extensions`, Developer mode, Load unpacked from this verified worktree's `extension\` folder.
- Open DataPass side panel > Dashboard. Verify layout visually at 1440px, 1280px, 900px, 390px. Capture non-sensitive screenshots only.
- Test `Mes cartes`, `Matin`, `Deep Work`, `Soir` cards: hide, move, resize, restore via Personnaliser, reload, verify per-mode independence.
- Seed a synthetic saved `https://github.com/julian-passebecq/diagramcloud` link in the workspace UI. Use Resume My Work and confirm no ChatGPT/Claude message body is accessed.
- With one disposable recently closed GitHub tab, click Recently closed and review the optional `sessions` permission. Test restore and a permission-denied case.
- In Galaxy Pulse, after an explicit public GitHub grant, verify a real public run URL, full source SHA (open Actions page), freshness timestamp and correct `UNKNOWN` labels for private PM/Brain/Factory. My Attention must never show "all green" when nothing is observed.
- Verify original V0.2 cards still work: news permissions and fallback, Manchester City ICS with timezone, Mentalist list, GitHub repo shortcuts, workspace JSON export/import only on disposable data.

D. **One-shot native PC diagnostics — only with explicit owner approval of registration.**
```powershell
cargo build --release --manifest-path bridge/Cargo.toml
.\scripts\install-native-host.ps1 -ExtensionId "REAL_32_CHAR_EDGE_EXTENSION_ID"
```
Use the actual ID displayed at `edge://extensions`. The HKCU registry operation above is a deliberate local change; do not perform it silently. Review the generated native host JSON's `allowed_origins` and absolute executable path. Click `Lire mon PC`; grant `nativeMessaging` only when prompted.
Compare timestamped total/available RAM and process count in the widget with Windows Task Manager and `Get-Process msedge`. Document that the Edge process RSS sum may double-count shared memory. Verify no Rust process persists, no files/credentials/command-line arguments are exported, no remote metrics upload occurs. Denied/missing host must show UNKNOWN/unavailable.

E. **RAM and page stability baseline.**
Use disposable anonymous tabs, never active ChatGPT drafts, in 5, 15 and 30 tab sets. Capture Task Manager total physical resident memory, Edge browser Task Manager, CPU idle 30s, and mode switching latency; repeat with tab-discard and without. Record the host's real measured values rather than inventing them. Also check layout scroll/focus behavior when cards update.

## Output and blocked states

Produce repo-local `docs/cockpit/evidence/windows-edge-YYYYMMDD.md` (or an artifact outside public Git if it contains user-specific data) with:
- Machine/OS/version, actual repo path and exact SHA;
- Provider-native session and writer qualification;
- Each test gate PASS/FAIL/UNKNOWN with reproduction and screenshot references;
- Public-safe screenshot redactions and private asset routing when needed;
- CI run ID, attempt, runner OS, source commit, artifact paths;
- Confirmations needed from owner, blockers, remediation PR/branch (do not merge/push without approval);
- A final one-line verdict QUALIFIED / BLOCKED / UNQUALIFIED.

Never claim unattended authenticated ChatGPT, Gmail or Claude histories are connected. Report GUI inaccessible or owner consent unavailable as `UNKNOWN`, not PASS.

# Cockpit V0.3 dependencies and access

| Resource | State | Requirement | Fallback |
|---|---|---|---|
| Existing Edge sidebar and V0.2 dashboard | Parent PR2, open/draft at kickoff | New branch stacks without altering original features | Existing custom mode and workspaces |
| Current Edge tabs | Browser tabs permission from V1 | User already installed extension | Saved workspace links |
| Recently closed tabs | Optional sessions permission | Granted only on button click | Display live and saved links; never scan full browser history |
| Agent / DiagramCloud / Mosaic / AtlasNote public GitHub CI | Optional api.github.com origin | Manual refresh; unauthenticated public API rate limits apply | Repo/Actions links and UNKNOWN |
| PM / Brain / Galaxy Hub | Private GitHub repositories | No authenticated browser adapter by default | UNKNOWN/private; no inferred running state |
| Factory | Explicit GitLab project link | No GitLab status API in this increment | Project link and UNKNOWN |
| Windows PC metrics | Local compiled Rust bridge 0.2, allowed extension ID, optional nativeMessaging | Windows native host installed, user clicks diagnostic | Unavailable; no fake data |
| Rust sysinfo | sysinfo crate 0.39 from crates.io, CI Linux compile | Build dependency; source checked through cargo | Diagnostic unavailable until host built |
| Dashboard storage | chrome.storage.local with schemaVersion 1 | Additive migration, independent modeLayouts | User's V0.2 custom layout preserved |
| AtlasNote | Independent app with origin/profile IndexedDB | Do not read or alter | Keep its verified backup/recovery procedure |
| Gemma / Ollama | Optional local availability | Model not loaded automatically and Ollama process != model | Model status UNKNOWN |
| GitHub Action checks | Existing GitHub workflow | Add stacked PR base branch, no scheduler | Missing evidence labelled UNKNOWN |

No connector tokens, personal account usage, signed URLs or private contents are embedded in this public repo. Public repository identities verified against GitHub prior to dispatch; private names are only user-facing product labels.

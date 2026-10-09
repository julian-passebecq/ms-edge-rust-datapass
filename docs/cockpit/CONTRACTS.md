# Edge Personal Cockpit V0.3 - product contract

Surface: TARGET=CHATGPT.COM. Product repo: julian-passebecq/ms-edge-rust-datapass.
Parent: feat/personal-dashboard-v1 @ 53ba42e11d64f752439291947a14ad2ceeee8659.
Proposed branch: feat/personal-command-center-v2 (draft stacked PR).
Owner selection: Resume My Work, Galaxy Pulse, Mon PC, independent Matin / Deep Work / Soir layouts. Additional small Attention/Norsk/R&D cards are optional removable companions.

## Data ownership and compatibility

Original V0.2 `datapass.edge.personal-dashboard.v1` key remains unchanged, schemaVersion 1 with additive `mode` and `modeLayouts` fields. A V0.2 document without `mode` normalizes to `custom` (Mes cartes), preserving saved cards, order, visibility, widths, repositories, tickers, episodes and imported fixture calendar. New installations start in Deep Work; no conversion requires profile reset.

`mode` = custom | morning | deep | evening. `cards` stays the legacy custom layout, while `modeLayouts` holds private independent layouts per preset. Card visibility/width/reorder/reset affects **only the active mode**. No background mode timer or hidden navigation. Existing `datapass.edge.workspaces.v1` URL metadata remains the only saved-workspace owner. AtlasNote IndexedDB is never read or modified.

## Resume My Work

- Uses live `chrome.tabs.query({currentWindow:true})` metadata and explicitly saved V1 workspace URLs only. No page content scripts or site-specific scraping.
- Optional `chrome.sessions` exposes recently closed eligible work tabs **only** when user clicks and grants `sessions`; recovered session data is held in dashboard memory and discarded on page close.
- Supports ChatGPT, Claude, GitHub and GitLab URL domains. No arbitrary browser history, remote transcript extraction, Codex terminal session claim or silent workspace reopening.
- Limit display to 8 of 12 eligible results; reopening a workspace is an explicit, capped user action.

## Galaxy Pulse / My Attention

- Named project coverage: PM, Agent, Brain, DiagramCloud, MosaicStudio, AtlasNote, browser, Visual Gallery and Factory.
- Public GitHub repos may return only their **last public Actions workflow** status, run URL, exact SHA and observation timestamp. A green workflow does not prove product/release completion or deployed availability. No API calls until explicit refresh and approved `api.github.com` origin.
- Private repos are labelled UNKNOWN/private without publishing their private repo addresses to this public codebase or attempting unauthorized access. Factory GitLab remains an external link with UNKNOWN CI. No invented native session/live ETA.
- Attention derives only from observed public CI statuses. An empty observation set means UNKNOWN, not PASS. No duplicated PM task database or CI engine.

## My PC / Rust security

- The existing Native Messaging bridge gains **only** the `system_snapshot` operation beside `ping`.
- The bridge is still installed manually by the owner in an allowlisted extension ID; permission `nativeMessaging` is optional and requested from an explicit dashboard click. `sendNativeMessage` launches the native process once and exits.
- A sysinfo snapshot returns platform, observation time, CPU sample, system RAM, sum of resident bytes for allowlisted Edge/Ollama/Docker/Node process names, and up to 3 anonymous disk free-space snapshots. No process command-line arguments, environment variables, mount paths, filenames or personal documents.
- The dashboard holds the response only in ephemeral JavaScript state. No remote dispatch, logging of content, continuous monitoring, auto-start, process control, shell, arbitrary file read or command execution.
- Edge process RSS values are approximate and can double count shared allocations. Ollama process observed != model loaded. If host is unavailable, metrics remain unavailable, never zero.

## Main journey

Edge sidebar > Dashboard > select Deep Work > Resume saved work > click public CI refresh > read a GitHub run SHA > click My PC and grant optional Native Messaging > inspect timestamped RAM/CPU > select Soir and hide Mentalist > return Deep Work > verify Pulse remains visible > reload and confirm layout state.

## Completion gates

Node deterministic tests and static security checks; Rust Linux build/unit tests; exact-head CI; manual real Windows/Edge profile integration with Rust host, IPC and user acceptance. Do not merge, deploy or label production qualified without owner permission and Windows evidence.

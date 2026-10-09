# EDGE-DASH V1 contract — DataPass personal dashboard

TARGET=CHATGPT.COM. Repository owner: julian-passebecq/ms-edge-rust-datapass. Parent: feat/edge-sidebar-v1 @ 81805226df1e8bd106ab724ad652163aa2ff4934. Branch: feat/personal-dashboard-v1. PR stacked on #1. No main merge or deployment.

## User journeys
1. Open Edge sidebar → Dashboard → hide a news card → resize a card → reload → preferences survive.
2. Open BBC → grant BBC RSS permission → see dated headlines or truthful error → open publisher article.
3. Import official Man City ICS → see upcoming events converted to Europe/Oslo → verify timing with publisher.
4. Click New ChatGPT/Claude → new tab, then save its URL in selected workspace → see grouped tree under provider.
5. Open GitHub repo shortcut → optionally permit api.github.com → show most recent public Actions run with SHA or UNKNOWN.

## Storage ownership
- Original V1 `datapass.edge.workspaces.v1` unchanged; owns URLs/project identity and side-panel tree.
- Dashboard `datapass.edge.personal-dashboard.v1`, schemaVersion=1; owns card order/visibility/width, pinned repos, ticker symbols, episode favorites, imported fixture records.
- Runtime-only feed results and public CI results are not persisted to disk, and are retrieved only after user clicks refresh.
- AtlasNote database `knowledge-atlas` never accessed or copied by dashboard. AtlasNote remains a browser application with verified manual backup.

## Permission boundary
Required Manifest V3: tabs/storage/sidePanel from V1. Optional: nativeMessaging, host grants for news.google.com, feeds.bbci.co.uk, api.github.com. No page content scripts or host permission for chatgpt.com, claude.ai, gmail.com, cloud.mongodb.com or Netflix.

- BBC: original BBC RSS feed.
- Other publishers: results **via Google News** RSS query, labelled as such; not represented as original publisher RSS.
- CNN official legacy RSS is stale, so not used.
- Gmail: direct inbox/compose shortcuts only. No Gmail OAuth, no unread count, no reading message bodies.
- Provider quotas: external direct account consoles; usage UNKNOWN without owner-authenticated adapter. No fake percentages or account usage.
- GitHub statuses: public API last workflow only, no private repo tokens, not proof of production release.
- CSV acceptance is not test evidence. Source-level Node/Cargo gates plus Windows Edge user journey required.

## Safety
No cross-origin cookie access, no arbitrary sites or arbitrary URL fetch, no proxy forwarding private content, no uncontrolled background polling, no automatic uploads, no cloud API key storage, no MongoDB database mutation. Imported ICS is user-selected and capped at 2MB; IANA TZID conversion for unambiguous times, with DST-gap/repeated-hour rejection; no guessed floating timestamps or all-day kickoff hours. All external links validated HTTP(S), DOM built by textContent.

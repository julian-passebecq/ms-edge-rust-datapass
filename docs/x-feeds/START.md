# X / Feeds — owner-selected navigation V1

TARGET=CHATGPT.COM. Product repository: `julian-passebecq/ms-edge-rust-datapass`.
This isolated feature branch adds a navigation-only X/Twitter feeds page. No automatic acquisition or background request is implemented.

## UX acceptance
- New **X / Feeds** access from existing Edge side panel and dashboard navigation.
- Dedicated local `x-feeds.html` with sub-tabs: Accueil, Mes listes, Signets, IA & agents, Microsoft Fabric, Visualisation.
- Add up to 24 user-defined feed links (X search, list, profile), rename by delete/add; reorder and delete personal entries; persistence in `chrome.storage.local` under `datapass.edge.x-feeds.v1`.
- Open one selected canonical feed in a real Edge tab; reuse a tab in the current window with the exact URL.
- Never load X in iframe; Following/For You are in-app X selections on `x.com/home`, not fabricated direct URLs.
- Restrict saved links to HTTPS exact x.com/twitter.com domains and read-only paths; reject redirects to other hosts and unsafe routes.
- No host permissions for x.com, content scripts, X APIs, scheduled refresh, automatic scrolling, post capture or model analysis.
- Existing Edge dashboard cards, workspaces, sidepanel and Visual Library shortcut retained.

## Checks
Node unit tests in `tests/x-feeds.test.mjs` verify feed defaults, canonical URLs, unsafe URL handling, duplicate/capacity and add/reorder/remove. UI screenshot and manual Windows Edge navigation remain separate evidence. No claims of logged-in X or local Windows runtime verification.

## Release boundary
This feature branch is *additive*. Full Visual Watch import/capture → review → R2 → Mongo V1 remains a distinct native qualification workstream. Do not call the larger integrated V1 production-ready until the owner has verified its actual Edge Windows installation, Native Messaging approval and an authenticated private R2/Mongo/Gallery round-trip. No merge or deployment is included in this feature publication.

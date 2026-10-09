# Sources, access, fallback

| Feature | Verified source or contract | Access | Failure fallback |
|---|---|---|---|
| Norwegian IT/data | digi.no and kode24.no/TU keywords via Google News | Optional news.google.com origin | Direct digi.no |
| BBC World and F1 | feeds.bbci.co.uk RSS | Optional feeds.bbci.co.uk origin | Direct BBC / Formula1 |
| BFM / BFM Business | Google News domain-limited query | Optional news.google.com origin | Open publisher |
| CNN | Google News domain-limited query; old CNN RSS feeds frozen | Optional news.google.com origin | CNN World |
| Netflix / 3 Body Problem | Netflix Tudum official November 2025 announcement + Google News headlines | Optional Google News; Tudum direct | Official Tudum article |
| Jeuxvideo.com tests | jeuxvideo.com/tests.htm + Google News targeted search | Optional Google News | JVC tests |
| Manchester City | mancity.com/fixtures official; local .ics file supplied by user | Local ICS file chooser only; UTC or IANA TZID with DST checks | Official fixture page |
| Yahoo Finance | User watchlist ticker links | No API | Yahoo Finance site |
| Gmail | Gmail inbox / compose links in existing Edge profile | No API or permission | Account sign-in in Gmail |
| GitHub repos and CI | api.github.com public latest Actions runs | Optional api.github.com origin | Repo / Actions links; UNKNOWN |
| Cloudflare Workers/R2 quotas | Cloudflare account usage page | Requires owner-authenticated adapter for metrics | Cloudflare dashboard, UNKNOWN |
| Netlify/GitHub quota | Official account billing/usage page | Requires provider authentication | Direct console, UNKNOWN |
| MongoDB Atlas | cloud.mongodb.com | Existing browser login, no API | Dashboard shortcut |
| AtlasNote | Existing independent Web app in own origin/profile | No data read | Repo link; verified AtlasNote recovery process |

External headlines/quotas may change or block browser fetch; a published URL does not prove live data availability. No CDN or third-party JavaScript is loaded. No user browser session is sent to Google News.

## Future access decisions
- Gmail metadata/counts: Gmail OAuth scopes are restricted and require consent and appropriate verification; defer until owner provisions a first-party client and chooses privacy policy.
- Provider quotas: never copy account credentials from ChatGPT plugins; design supported authenticated adapters with least privilege.
- Live Manchester City schedule: provider agreement or official calendar subscription parser with timezone and rescheduling semantics.
- R&D Gemma: optional explicit local inference subprocess; bench RAM first.

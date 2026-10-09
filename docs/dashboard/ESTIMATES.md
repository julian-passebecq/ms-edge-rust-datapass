# Follow-on phases — planning ranges, not measured execution

| Phase | Candidate implementation | Engineering time range | Agent token range | Confidence | Assumptions |
|---|---|---|---|---|---|
| V1 Windows qualification | Edge install, RSS permissions, visual QA, ICS and workspace smoke path | 2-6 hours | 4k-12k | Medium | Windows host and browser access; user confirms AtlasNote recovery |
| V2 Gmail and provider quotas | Secure OAuth adapters, provider consent, access review and integration tests | 18-50 hours | 30k-100k | Low | APIs and accounts available; verification time not included |
| V2 fixture subscriptions | Official ICS refresh, timezone, fixture changes and identifiers | 7-18 hours | 10k-35k | Low | Provider publishes an accessible calendar with stable license |
| V3 optional local AI | Model benchmarks and opt-in classification | 8-22 hours | 15k-45k | Low | Local RAM/GPU capacity measured and permitted |

These are ballpark effort estimates, not commitments, runtime telemetry, account quotas or billing predictions. Selection by owner required for future scopes.

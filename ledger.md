# Conversion Ledger

## Completed
- [x] Inspect recursive upstream tree and representative runtime/document files.
- [x] Classify upstream as MIXED and inventory all 231 tracked file blobs.
- [x] Inspect version-matched Harness bundle, Cordis service, skill registry/provider/consumer and pre-step lifecycle contracts.
- [x] Copy all 231 upstream blobs to `vendor/` and audit exact blob SHA, mode and byte counts in candidate Git tree `33d7dc915d4f452af3432e7e53536cf6abaa1560` (zero differences).
- [x] Create the native bundle manifest, Cordis adapter, compiled ESM entrypoint, TypeScript source, type declaration and contract tests.
- [x] Run local JavaScript syntax check and three package-contract tests.
- [x] Run a mocked runtime smoke test against two fixture skills (registration, body retention, invocation policy and bootstrap ordering/idempotence).
- [x] Run a strict TypeScript semantic check against local declarations modeled from the inspected public Harness contracts.
- [x] Document capability coverage and profile-dependent gaps.

## Pending
- [ ] Build/typecheck against the actual installed DeepSeek Harness packages.
- [ ] Install from GitHub with `dsh plugin --profile web add github:mulqizamzam/mulqi-superpowers`.
- [ ] Start a real Cordis Loader/profile and inspect composed configuration.
- [ ] Confirm all 15 skills appear in the live catalog and invoke them with the actual `skill` tool.
- [ ] Validate bootstrap in a clean session and after compaction.
- [ ] Run the upstream acceptance prompt: “Let's make a react todo list”; capture the transcript.
- [ ] Exercise profile-specific subagent, shell, todo, web and browser capabilities.

## Notes

The adapter's local mock uses only two fixture skills and does not prove behavior in the Harness runtime. The semantic TypeScript check uses modeled declarations rather than installed Harness packages. `verification.md`" records these distinctions. The upstream source under `vendor/` is not rewritten.
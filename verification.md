# Verification

## Status: NOT GREEN — live Harness integration tests not run

### Verified source preservation

- Upstream: `obra/superpowers`, `main` tree `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`.
- Upstream tracked files: 231; total tracked bytes: 1,534,073.
- Candidate target Git tree `33d7dc915d4f452af3432e7e53536cf6abaa1560` was recursively audited against upstream: 231 source files and 231 `vendor/` files; zero missing, extra, SHA or mode differences; byte count matched; root MIT License copy SHA matched.
- The candidate tree is the base for this publication commit; adapter/documentation files are added outside `vendor/`.

### Local checks completed for this adapter revision

| Check | Result | Scope |
|---|---|---|
| `node --check lib/index.js` | PASS | JavaScript syntax only. |
| `npm test` | PASS (3/3) | Package manifest, documented lifecycle references and tool-name contract. |
| Mocked runtime smoke | PASS | Two temporary fixture skills; registration, original body preservation, invocation flags, pre-step injection ordering and duplicate guard. Not a real Harness runtime. |
| TypeScript semantic check | PASS against modeled declarations | Strict check with local declaration stubs based on inspected public APIs; not a check against installed DSH package types. |

The runtime available for local tests was Node.js 22.16.0; the package declares Node.js >=22.19.0 for the target Harness environment. The local version is below that declared minimum.

### Not run — release blockers

- `npm run build` against installed `@deepseek-ai/cordis`, `@deepseek-ai/dsh-agent`, `@deepseek-ai/dsh-llm` and `@deepseek-ai/dsh-skill` package declarations.
- `dsh plugin --profile web add github:mulqizamzam/mulqi-superpowers`.
- Real Harness profile startup, Cordis Loader composition and `--dump-config` inspection.
- Live Skill Registry/catalog enumeration proving all 15 skills are available.
- Real model-facing `skill` tool invocations and resource reads.
- Clean-session bootstrap and compaction/retry behavior.
- Acceptance transcript for “Let's make a react todo list”.
- Profile-specific subagent, Windows PowerShell/Bash, todo, web and browser/computer-use execution.

### Interpretation

PASS results above apply only to the checks explicitly described. Mocked tests and modeled type declarations do not establish successful Harness integration. No prompt or upstream source file has been modified to mask a compatibility issue. Keep status NOT GREEN until the live Harness checks pass.
# Verification

## Status: NOT GREEN — live Harness integration tests not run

### Verified source preservation

- Upstream: `obra/superpowers`, `main` tree `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`.
- Upstream tracked files: 231; total tracked bytes: 1,534,073.
- Candidate target Git tree `33d7dc915d4f452af3432e7e53536cf6abaa1560` was recursively audited against upstream: 231 source files and 231 `vendor/` files; zero missing, extra, SHA or mode differences; byte count matched; root MIT license copy SHA matched.
- The candidate tree is the base for the published `main` history; adapter/documentation files are added outside `vendor/`.

### Regression report for latest fix

- Fixed the compiled ESM named export to use `MulqiSuperpowersService`, matching its default export and TypeScript source.
- Fixed both metadata cleanup statements to use the declared `passthroughMetadata` object rather than the misspelled, undeclared `passthroughMetada` identifier.
- Added regression tests for named/default export identity and the metadata cleanup identifier.

### Local checks completed

| Check | Result | Scope |
|---|---|---|
| `node --check lib/index.js` | PASS | JavaScript syntax. |
| `npm test` | PASS (5/5) | Package contract, lifecycle/tool mappings, export identity and metadata cleanup regression checks. |
| Mocked import/runtime smoke | PASS | Imported actual compiled ESM entrypoint with temporary Cordis/LLM/YAML stubs, instantiated default export, registered two fixture skills, exercised metadata cleanup and injected bootstrap. Not a real Harness runtime. |
| Previous strict TypeScript semantic check | PASS against modeled declarations | Local declarations modeled from inspected public APIs; not installed DSH package types. TypeScript source was not changed by this regression fix. |

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

The two reported defects are corrected in the compiled entrypoint and covered by regression checks. PASS results above apply only to the checks explicitly described. Mocked tests and modeled type declarations do not establish successful Harness integration. No upstream source or prompt under `vendor/` was modified. Keep status NOT GREEN until the live Harness checks pass.

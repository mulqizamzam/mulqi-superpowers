# Mulqi Superpowers — Conversion Report

## Source classification

**MIXED: executable code and prompt/document bundles.** The source contains Node ESM entrypoints, OpenCode and Pi plugins, a Python Hermes adapter, shell hooks, platform manifests, maintenance scripts and tests. It also contains 15 reusable skill directories with Markdown instructions, prompts, references, templates and scripts.

## Preservation

All 231 tracked source blobs (1,534,073 bytes) are retained under `vendor/` at their original relative paths. The Git tree audit recorded zero missing/extra files and zero blob-SHA or mode differences against upstream. The root MIT `LICENSE` is also included.

## Harness conversion

The root package is a DeepSeek Harness bundle. Its Cordis adapter registers the 15 original skill entrypoints through the documented `ctx.skills` registry, preserves their Markdown bodies and adjacent resource roots, and carries through user/model invocation flags. It injects the source `using-superpowers` body using the `agent/pre-step` lifecycle and a source-attributed marker.

Tool guidance is limited to names confirmed in the inspected base Harness profile: `skill`, filesystem/search tools, `bash` or `pwsh`, subagent/delegation-control tools, `todo_write`, `web_search` and `web_fetch`. It explicitly notes profile-dependent browser/computer-use and Bash-versus-PowerShell boundaries.

Upstream OpenCode/Pi/Hermes adapters, hooks, manifests, release scripts and tests remain preserved source assets under `vendor/`; they are not represented as native Harness implementations.

## Local verification

JavaScript syntax, three package-contract tests, a two-skill mocked runtime smoke test, and a strict TypeScript check against modeled declarations passed. Those checks do not substitute for building against installed DSH packages or running the plugin in a real Harness profile.

## Outstanding release verification

The live package add/install, Cordis Loader/profile startup, `--dump-config`, complete 15-skill catalog, model-facing invocation, bootstrap/compaction, acceptance prompt transcript and profile-specific tool execution have not been run. See `verification.md`; status remains **NOT GREEN**.

## Installation candidate

```bash
dsh plugin --profile web add github:mulqizamzam/mulqi-superpowers
```

Use only as an integration candidate until the live checks above are completed. This report does not claim the bundle is production-verified.

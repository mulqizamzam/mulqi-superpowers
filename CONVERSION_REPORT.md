# Mulqi Superpowers — Conversion Report

## Repository classification

**MIXED: executable code and document/prompt collection.**

Evidence includes Node.js ESM entrypoints, OpenCode and Pi plugins, a Python Hermes adapter, shell session hooks, maintenance scripts, tests and platform manifests. The repository also contains 15 reusable skill bundles with Markdown instructions, prompts, references, templates and scripts. Complete inventory: `repo-inventory.md`.

## What's exposed vs vendored-only

### Intended Harness skill exposure

The 15 skill entrypoints are suitable for the documented Harness skill architecture: `@deepseek-ai/dsh-skill` registry, `@deepseek-ai/dsh-skill-filesystem` provider, and `@deepseek-ai/dsh-tool-skill` catalog/loader. Configure the filesystem provider with a bundled root pointing to the unchanged source `skills/` tree. Supporting references/prompts/templates stay adjacent to their skill as resources.

### Vendored-only

Existing OpenCode, Pi, Hermes, Claude Code, Codex, Gemini, Antigravity, Cursor, Devin, Kimi and Muse adapters/manifests are platform-specific and are not falsely represented as native Harness features. Repository maintenance scripts and tests are retained source assets rather than user-facing model commands.

## What works today

- Source tree inspected at `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`.
- MIXED classification and capability boundary documented.
- Harness package-authoring and skill-provider/loader contracts inspected.
- Target exists, is public, and permits pushes.
- Target `main` initialized with README commit `426512c81f4cdd72997f30b5738fb1cb19628e78`.

No runnable Harness plugin has been built or loaded. No source file has yet been certified as copied byte-identically into `vendor/`.

## Known Gaps

- **Automatic bootstrap:** The source porting guide makes automatic `using-superpowers` injection at every session start a hard requirement. A supported DeepSeek Harness startup/message-injection API was not confirmed in the inspected public documentation. Without this, source acceptance criteria are not met.
- **Runtime action mapping:** Subagent dispatch, todo tracking, browser visual companion and web workflows must map to actual Harness tools/services and be tested. No tool names are invented.
- **Harness load test:** A genuine Cordis function-plugin package and real Loader-composition test are required. This execution did not have a local Harness or Node/pnpm runtime.
- **Exact vendor preservation:** The complete 231-file source needs its original Git blobs copied, including two binary PNG assets and the 112,907-byte release-notes file. Vendor diff/hash audit has not run.
- **Acceptance transcript:** No clean-session “Let's make a react todo list” transcript exists. Automatic brainstorming activation remains unverified.

## Install / smoke-test steps (after implementation)

Follow the version-matched DeepSeek Harness package cookbook. Compose the documented skill registry, filesystem provider configured with the bundled source skill directory, and model-facing skill loader in a real Cordis Loader application profile. This report does not claim an installable package is already available.

Required smoke test:
1. Start a clean Harness session with the package composed.
2. Confirm all 15 skills appear in the session catalog.
3. Invoke the actual `skill` tool with `brainstorming`; assert the output includes the complete source instruction body after documented frontmatter handling.
4. Test relative resource guidance and supporting resource reads.
5. Submit “Let's make a react todo list” in a new session and capture whether brainstorming loads before code changes.
6. Run the real Loader-composition and package tests.
7. Compare every file under `vendor/` with its upstream blob and record exact count/hash results.

## Git

- Remote: https://github.com/mulqizamzam/mulqi-superpowers.git
- Branch: `main`
- Commit SHA: `426512c81f4cdd72997f30b5738fb1cb19628e78` (README initialization only)
- No conversion commit was pushed because verification is not green.

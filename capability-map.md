# Capability Map

## Source classification: MIXED

`obra/superpowers` contains executable adapters, hooks, scripts and tests as well as 15 reusable skill bundles. The full, unchanged source snapshot is retained under `vendor/`.

## Fifteen skills exposed through Harness

| Source skill | Harness exposure | Dependency or boundary |
|---|---|---|
| `brainstorming` | Skill Registry and `skill` loader | Visual companion/browser workflow is profile-dependent. |
| `diagnosing-superpowers` | Skill Registry and loader | Supporting prompts, references and templates remain adjacent vendor resources. |
| `dispatching-parallel-agents` | Skill Registry and loader | Requires subagent tools in the active profile. |
| `executing-plans` | Skill Registry and loader | Scripts require a compatible shell/runtime. |
| `finishing-a-development-branch` | Skill Registry and loader | Git/filesystem actions require host tools. |
| `receiving-code-review` | Skill Registry and loader | Prompt-only workflow. |
| `requesting-code-review` | Skill Registry and loader | Delegated reviewer requires subagent capability or a manual fallback. |
| `subagent-driven-development` | Skill Registry and loader | Requires subagent, delegation-control and shell tools. |
| `systematic-debugging` | Skill Registry and loader | Some examples/scripts require shell or language runtimes. |
| `test-driven-development` | Skill Registry and loader | Test execution depends on the target project's test runner. |
| `using-git-worktrees` | Skill Registry and loader | Requires Git and filesystem/shell access. |
| `using-superpowers` | Skill Registry plus automatic pre-step bootstrap | Injection is implemented; live-session verification remains pending. |
| `verification-before-completion` | Skill Registry and loader | Verification evidence depends on actual host tools. |
| `writing-plans` | Skill Registry and loader | Prompt workflow. |
| `writing-skills` | Skill Registry and loader | Graph renderer requires Node.js if used. |

## Harness-native adapter

The package uses the documented Cordis plugin and bundle pattern. It imports the Cordis `Service`, declares the `skills` service dependency, and registers each `SKILL.md` through `ctx.skills.register()`. It retains the original Markdown instruction body, invocation flags and adjacent resource directory.

The adapter injects the original `using-superpowers` body as a source-attributed user message in `agent/pre-step`, guarded by a stable marker and inserted after recognized compaction summaries.

## Tool and runtime boundaries

The base profile inspected during conversion exposed `skill`, filesystem/search tools, `bash` (POSIX) or `pwsh` (PowerShell), `subagent`, `subagent_fork`, delegation-control tools, `todo_write`, `web_search` and `web_fetch`. A user's selected profile may expose a smaller set; the bootstrap therefore instructs the model not to invent missing tools.

Browser/computer-use is profile-specific. Bash scripts are not directly executable through PowerShell with the same semantics.

## Preserved but not ported as Harness runtime

Upstream OpenCode/Pi/Hermes adapters, hooks, platform manifests, packaging scripts and source test suites remain unchanged under `vendor/`. Their host-specific APIs are not invoked by this adapter.

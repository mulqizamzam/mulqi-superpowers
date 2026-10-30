# Capability Map

## Classification decision: MIXED

The source contains both executable code and a substantial document/prompt collection.

Evidence: runtime entrypoints and scripts include `index.js`, `.opencode/plugins/superpowers.js`, `.pi/extensions/superpowers.ts`, `.hermes-plugin/__init__.py`, shell hook scripts, and language-specific test suites. `package.json` defines an ESM package with runtime and extension entrypoints. In parallel, the repository contains 15 top-level skill packages with `SKILL.md` documents, prompts, references, templates, and companion resources.

## Document and prompt collection

| Source capability | Files / scope | Harness surface | Notes |
|---|---|---|---|
| Brainstorming | `skills/brainstorming/SKILL.md`, builder prompt, visual companion | Skill provider + skill loader | Visual companion resources are adjacent files. |
| Diagnosing Superpowers | `skills/diagnosing-superpowers/SKILL.md`, prompts, references, templates | Skill provider + skill loader | Diagnostic workflow and resource bundle. |
| Parallel agents | `skills/dispatching-parallel-agents/SKILL.md` | Skill provider + skill loader | Depends on actual subagent facilities. |
| Executing plans | `skills/executing-plans/SKILL.md`, task scripts | Skill provider + shell | Scripts run in the workspace context. |
| Branch finishing | `skills/finishing-a-development-branch/SKILL.md` | Skill provider + shell/git | Git operations require host tools. |
| Review reception | `skills/receiving-code-review/SKILL.md` | Skill provider | Prompt workflow. |
| Review requests | `skills/requesting-code-review/SKILL.md`, reviewer prompt | Skill provider + subagent or fallback | Dispatch interface is host-dependent. |
| Subagent-driven development | `skills/subagent-driven-development/SKILL.md`, prompts, references, scripts | Skill provider + shell + subagent | Actual tool mapping must be validated. |
| Systematic debugging | `skills/systematic-debugging/SKILL.md`, references, examples, shell/TS scripts | Skill provider + shell | Supporting files remain adjacent. |
| TDD | `skills/test-driven-development/SKILL.md`, writing-good-tests | Skill provider | Workflow prompt. |
| Git worktrees | `skills/using-git-worktrees/SKILL.md` | Skill provider + shell/git | Requires filesystem/git access. |
| Using Superpowers | `skills/using-superpowers/SKILL.md`, platform tool mappings | Skill provider; bootstrap gap | Source mandates injection at every session start. |
| Verification | `skills/verification-before-completion/SKILL.md` | Skill provider | Workflow prompt. |
| Planning | `skills/writing-plans/SKILL.md` | Skill provider | Workflow prompt. |
| Authoring skills | `skills/writing-skills/SKILL.md`, references, graph renderer | Skill provider + Node for renderer | Resource bundle. |

Harness documents a native skill pipeline: `@deepseek-ai/dsh-skill` registry, `@deepseek-ai/dsh-skill-filesystem` provider, and `@deepseek-ai/dsh-tool-skill` model-facing catalog/loader. The filesystem provider supports a configured `bundledSkillDir`; supporting resource files can remain adjacent to skill definitions.

## Executable code and integration assets

| Source | Capability | Candidate plugin surface | Disposition |
|---|---|---|---|
| `index.js`, `package.json` | npm/OpenCode runtime package entry | Harness package metadata only after native package design | Preserve unchanged; don't assume Harness uses npm main directly |
| `.opencode/plugins/superpowers.js` | OpenCode V1/V2 runtime and context injection | No direct Harness runtime | Vendored-only; host APIs differ |
| `.pi/extensions/superpowers.ts` | Pi extension and session context injection | No direct Harness runtime | Vendored-only; host APIs differ |
| `.hermes-plugin/*` | Hermes Python plugin adapter | No direct Harness runtime | Vendored-only |
| `hooks/*` | Session-start hook adapters | Harness lifecycle adapter if supported | Not exposed; API not confirmed |
| `skills/brainstorming/scripts/*` | Visual companion HTTP/WS app and browser assets | Skill resources + shell/process capability | Execution integration unverified |
| `skills/*/scripts/*` | Workflow scripts | Skill resources + shell invocation | Host-specific invocation needs testing |
| `scripts/*` | Source build/release/packaging helpers | Maintainer-only commands | Vendored-only |
| `tests/*` | Regression suites | Maintainer verification | Vendored-only; not run in Harness |

## Harness contract evidence

Inspected the Harness package-authoring cookbook, package-specific conventions, and three skill packages:
- `packages/skill/skill`
- `packages/skill/skill-filesystem`
- `packages/skill/tool-skill`

The package cookbook requires Cordis plugin exports, package metadata, workspace registration and real Loader-composition tests. No supported external-plugin startup/message injection API was confirmed in the inspected public documentation.

## Integration boundary

The skills can map to the documented Harness skill provider/registry/loader. However, the source's own porting guide requires automatic injection of `using-superpowers` into every session. Without a verified Harness startup lifecycle mechanism, the complete port acceptance criterion cannot be claimed. Subagent, todo, browser/visual-companion and web affordances require actual tool/service mappings and tests before exposure.

## Exact preservation

Every original tracked file must be copied under `vendor/` at the same relative path. The original tree contains binary PNG assets and a 112,907-byte release-notes file; exact preservation requires raw blob copying and a blob/hash comparison.

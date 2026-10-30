# Mulqi Superpowers

A DeepSeek Harness bundle port of the 15 skills in the MIT-licensed [obra/superpowers](https://github.com/obra/superpowers) project.

**Status: integration candidate; live Harness verification is incomplete.** All 231 upstream tracked files are retained byte-for-byte under `vendor/`. The native adapter registers the source skills and injects the original `using-superpowers` guidance on the agent pre-step lifecycle.

## Install

```bash
dsh plugin --profile web add github:mulqizamzam/mulqi-superpowers
```

Use a profile that includes the Harness Skill Registry and Skill loader. Restart the profile after installation, inspect the composed configuration, and verify the skill catalog. This revision has **not** yet been installed and tested against a live Harness runtime.

## Included

- The full upstream source snapshot under `vendor/`: 231 files, including prompts, references, templates, scripts, tests, manifests and binary assets.
- A native Harness bundle manifest (`package.json` and `cordis.patch.yml`).
- A Cordis service that registers all 15 skill definitions with their Markdown bodies, resource directories and invocation flags.
- Automatic `using-superpowers` context injection through `agent/pre-step`.
- Tool-compatibility guidance for skill, filesystem, search, shell, delegation, todo and web capabilities.

## Runtime boundaries

- `bash` is a POSIX shell. `pwsh` is PowerShell; it does not execute Bash scripts with Bash semantics.
- Browser/computer-use support is profile-dependent and is not installed by this bundle.
- Upstream platform adapters and scripts remain under `vendor/`, but are not falsely represented as native Harness APIs.
- Skill prompts are instructions, not an access-control boundary or a guarantee of model compliance.

## Verification

See [`verification.md`](verification.md). The upstream vendor blob audit and local adapter checks passed. Live DSH installation, Loader startup, complete catalog, skill invocation and acceptance checks remain **NOT GREEN**.

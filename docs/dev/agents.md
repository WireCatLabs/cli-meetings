# Running agents on cli-meetings

The guards are copied from tg-cli's
[`docs/dev/agents.md`](https://github.com/WireCatLabs/tg-cli/blob/main/docs/dev/agents.md), where each was
measured; `bin/check-agents` proves they hold here.

## What an agent may do, and what stops it

| | How |
|---|---|
| **File edits only in `~/Projects/AI`** | [`.claude/hooks/writes-stay-inside.sh`](../../.claude/hooks/writes-stay-inside.sh) on Edit, Write and NotebookEdit, in every mode. Allowed: every project beside this one (the consumers tg-cli, max-cli, cli-memo, cli-tasks and community move with this package), the session's scratch folders and this project's memory. It refuses the guards themselves — `.claude/settings*.json` and `.claude/hooks/` in any checkout |
| **Shell commands in `~/Projects` and the package caches** | the Bash sandbox in [`.claude/settings.json`](../../.claude/settings.json): writes in `~/Projects`, `~/.cache`, `~/.local/share/pnpm`, `~/.npm`, `/tmp` and `/var/tmp/claude`. Not all of `~/`: with it, `bin/check-agents` could read `~/.ssh`, `~/.gnupg`, `~/.aws` and `~/.npmrc` (2026-10-11) (owner's choice, 2026-10-11, [`bin/relax-guards`](../../bin/relax-guards)). The sandbox still write-protects `.git/config`, `.git/hooks` and `.claude/` settings — documented as having no exemption. **Every worktree goes in `.worktrees/` of its checkout, by a relative path**: `git worktree add .worktrees/<name> …` (an absolute or `~` path keeps the call sandboxed). Local sockets are open, so the keyring over D-Bus works — `gh` needs it |
| **No way out of the sandbox** | `allowUnsandboxedCommands: false` makes Claude Code ignore `dangerouslyDisableSandbox`, and [`.claude/hooks/sandbox-stays-on.sh`](../../.claude/hooks/sandbox-stays-on.sh) refuses the call. `failIfUnavailable: true` stops a session from starting when the sandbox cannot start: without it, every shell command ran unprotected and silently — measured 2026-10-11 in a session whose shell wrote outside the allowed folders |
| **Git** | runs outside the sandbox (`excludedCommands: ["git *"]`), so `git push -u` and `--track` record the upstream — only when the whole Bash call is git: `cd … && git …` stays sandboxed. Over SSH: other commands cannot read `~/.ssh`, `~/.gnupg`, `~/.aws`, `~/.npmrc` and `~/.pypirc`; only `~/.ssh/id_ed25519.pub` and `known_hosts` are re-opened, and the SSH agent's socket signs and pushes |
| **Refused, in every mode** | `sudo` |

## Guards copied from cli-tasks

`.claude/settings.json` and `.claude/hooks/` came from cli-tasks and still name it in two places: the
sandbox may write to cli-tasks, and the hook allows `cli-tasks-*` worktrees and cli-tasks' memory folder.
Agents cannot change the guards, so [`bin/adopt-guards`](../../bin/adopt-guards), run by the owner from a
terminal, swaps those names for cli-meetings.

## Checking the guards

From a terminal, never from inside a Claude session:

```sh
bin/check-agents                 # a headless session in bypass mode tries each item; each says what must happen
bin/trust-folder <worktree>...   # a new worktree's .claude/settings.json is ignored until the folder is trusted
```

## The private trail

The plan, journal and decisions for this package live in max-cli's private `docs_ai`. Agents write
them only through a worktree in `.worktrees/`, never in the main `docs_ai` checkout, which other
sessions use:

```sh
git -C ../max-cli/docs_ai worktree add --no-track -b journal/<topic> "$PWD/.worktrees/private-<topic>" origin/main
```

Its commits and the journal's id counter land in `max-cli/docs_ai/.git`, which
[`bin/allow-private-trail`](../../bin/allow-private-trail), run by the owner from a terminal, opens
to the sandbox. Measured 2026-10-04: the journal written and merged this way.

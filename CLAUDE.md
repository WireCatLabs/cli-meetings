# cli-meetings — working rules

The shared layer for meeting tools, published as `@wirecat/cli-meetings`: events and meetings, the WebVTT
parser, the source port each provider implements and the store port the shared store implements; later
the pull, the import, the meeting commands and the MCP read tools. `zoom-cli` (`zm`) is the first
provider. Start with the one page that covers what you are about to touch:

- [`docs/dev/ARCHITECTURE.md`](docs/dev/ARCHITECTURE.md) — the model, the tables, who depends on whom.
- [`docs/dev/CONVENTIONS.md`](docs/dev/CONVENTIONS.md) — the shared conventions, and what differs here.
- [`docs/dev/TESTING.md`](docs/dev/TESTING.md) — the checks and the coverage floor.
- [`docs/dev/RELEASING.md`](docs/dev/RELEASING.md) — publishing, and the first publish the owner does.
- [`docs/dev/agents.md`](docs/dev/agents.md) — what an agent may change here, and what stops it.
- [`docs/dev/ROADMAP.md`](docs/dev/ROADMAP.md) — the providers after Zoom.

## The constraints that shape everything

1. **This repository is public.** No real transcript, name, meeting title or meeting text in fixtures,
   tests, docs or commit messages — invented people only (`Alice Example`, `Bob Sample`). A capture
   from a real account keeps keys and types, never values.
2. **Nothing here knows a provider.** Zoom's ids, login and quirks live in `zoom-cli`; a provider
   reaches this package only through `MeetingSource`. `biome.json` refuses provider libraries under `src/`.
3. **Nothing here touches a database.** This package defines `MeetingStore`, the port for events and
   meetings, and runs everything on it; cli-messaging owns the tables and implements the port over the
   shared SQLite store, as it does for cli-tasks. `biome.json` refuses SQLite, `node:fs`, Drizzle and
   cli-messaging under `src/`.
4. **cli-messaging depends on this package, never the other way round.** A change reaches `zm` through
   a release of this package, then of cli-messaging. Tests use an in-memory store; the real store is
   the owner's data from tg, max and memo.
5. **Every provider fits the same port.** Google Meet, Teams and assistant bots come later; a change that
   only Zoom needs belongs in `zoom-cli`.

## Comments

Sparse, and only *why*. No comment restating the line, no banners, no narrating the change.

## Deletions

Never delete or clean up mid-task. Append a line to [`CLEANUP.md`](CLEANUP.md) — the path, why, the
date — and do the removals in one batch after the owner confirms. Never kill a process by name —
find the PID, confirm it is yours, kill that PID.

## Committing

Conventional commits. The pre-commit hook checks staged lint and secrets; no other local checks are required by default.

A branch off `main`, in a worktree, and a pull request. A change a caller can see gets a line under
`## Unreleased` in [`CHANGELOG.md`](CHANGELOG.md). `bin/release` on `main` publishes —
[RELEASING](docs/dev/RELEASING.md).

## Development check budget

Local commits check only staged lint and secrets. There is no pre-push check.
Config integrity, repository lint, Markdown, and secret detection run in PR CI. Full typechecking, tests,
coverage, builds, parity, browser and platform suites run for releases or an
explicit manual validation. See the
[shared policy](https://github.com/WireCatLabs/community/blob/main/standards/README.md#ci-and-hooks).

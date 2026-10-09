# cli-meetings — working rules

The shared layer for meeting tools, published as `@wirecat/cli-meetings`: the meeting model, the WebVTT
parser and the source port each provider implements; later the import, the saving into the shared store,
the meeting commands and the MCP read tools. `zoom-cli` (`zm`) is the first provider. Start with the one
page that covers what you are about to touch:

- [`docs/dev/ARCHITECTURE.md`](docs/dev/ARCHITECTURE.md) — the modules, the store mapping, who depends on whom.
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
3. **The core stores nothing.** The model, the parser and the port import no SQLite, no `node:fs`, no
   Drizzle and no cli-messaging; `biome.json` refuses them under `src/`. Saving into the shared store
   will be its own entry point, the only one allowed to import cli-messaging.
4. **cli-meetings depends on cli-messaging, never the other way round**, and only once the store layer
   lands. The store is the owner's real data from tg, max and memo: tests use a temporary store, never it.
5. **Every provider fits the same port.** Google Meet, Teams and assistant bots come later; a change that
   only Zoom needs belongs in `zoom-cli`.

## Comments

Sparse, and only *why*. No comment restating the line, no banners, no narrating the change.

## Deletions

Never delete or clean up mid-task. Append a line to [`CLEANUP.md`](CLEANUP.md) — the path, why, the
date — and do the removals in one batch after the owner confirms. Never kill a process by name —
find the PID, confirm it is yours, kill that PID.

## Committing

Conventional commits. Before committing:

```sh
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm docs:check
```

A branch off `main`, in a worktree, and a pull request. A change a caller can see gets a line under
`## Unreleased` in [`CHANGELOG.md`](CHANGELOG.md). `bin/release` on `main` publishes —
[RELEASING](docs/dev/RELEASING.md).

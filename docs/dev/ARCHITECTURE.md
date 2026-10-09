# Architecture

Published as `@wirecat/cli-meetings`. Each meeting provider is its own package that implements
`MeetingSource`; this package owns everything above that port.

## The modules

| File | What |
|---|---|
| [`src/model.ts`](../../src/model.ts) | `MeetingSeries`, `Occurrence`, `TranscriptLine`, `ChatLine`, `Summary`, and `lineId` |
| [`src/vtt.ts`](../../src/vtt.ts) | `parseVtt`: WebVTT cues to transcript lines, the speaker taken from `Name: text` |
| [`src/source.ts`](../../src/source.ts) | `MeetingSource`, the port a provider implements |

Still to come, in this order: the import of a folder of transcript files, saving into the shared
store, the commands (`meetings list|show`, `transcript`, `search`, `pull`) and the MCP read tools.

## Shared versus per provider

- **Here:** the model; the parser, because Zoom's API and Zoom's downloaded files use the same
  WebVTT with the speaker inline; importing; saving; the commands and MCP tools; the port.
- **In the provider's package** (`zoom-cli` first): login, the API client, the provider's ids and
  quirks, and one `MeetingSource` per way in — `api`, `files`, `browser`.

## Which way the dependency runs

cli-meetings will depend on `@leemour/cli-messaging`, not the other way round as cli-tasks does. The
plan gives saving, the commands and the MCP tools to this package, and they need cli-messaging's
store and command kit; a pure library would push all of that into every provider. The core above
(model, parser, port) still imports nothing from it, and the lint rule in
[`biome.json`](../../biome.json) holds that line. The dependency is added with the first code that
imports it.

## The store mapping

Meetings go into the same SQLite store as tg, max and memo, so `search all` and `memo context` see
them with no change there. Checked in cli-messaging's `src/store/` on 2026-10-09:

| Meeting | Store | Status |
|---|---|---|
| a series | a chat, `saveChats` under an account key `{ provider, account }` | the method exists and is exported from `@leemour/cli-messaging/store` |
| a transcript or chat line | a message, `saveMessages`; time = occurrence start + `startMs`, sender = speaker, id = `lineId` | the method exists |
| an occurrence | the messages' `threadId` | the store keeps only the thread id on a message: there is no topics table, so an occurrence's start, end and title have no place yet |
| a speaker | a person, `savePeople` | the method exists; linking to a tg or max contact is not checked |
| the provider's summary | an internal note, `addNote({ text, title, about })` | the method exists; what `about` should point at is not checked |

To confirm before the first write: where an occurrence's own fields live (provider metadata on the
chat, or a meeting-only table — the case the plan allows); whether an account row must exist before
`saveChats`; and what `about` refers to. Meeting-only tables come only where this mapping cannot hold
something.

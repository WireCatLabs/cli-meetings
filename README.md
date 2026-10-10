# @wirecat/cli-meetings

The shared layer for meeting tools, as `cli-messaging` is for messenger tools: one model for meetings,
their transcripts, chat and summaries, a WebVTT parser, source and store ports, ingestion, commands
and MCP read tools.
The first provider is Zoom, through `zoom-cli`. What is planned next is in
[`docs/dev/ROADMAP.md`](docs/dev/ROADMAP.md); what changed in each version is in
[`CHANGELOG.md`](CHANGELOG.md).

```ts
import { parseVtt } from "@wirecat/cli-meetings"

const [first] = parseVtt("WEBVTT\n\n00:00:01.500 --> 00:00:04.000\nAlice Example: Shall we start?\n")
// [{ startMs: 1500, endMs: 4000, speaker: "Alice Example", text: "Shall we start?" }]
if (first) console.log(first.text) // "Shall we start?"
```

## What is in it

| | |
|---|---|
| `Event`, `EventSeries` | the owner's events, independent of any provider |
| `Meeting`, `MeetingSeries`, `Participant` | stored occurrences, series and the identities present |
| `Transcript`, `TranscriptRow`, `ChatLine`, `Summary`, `Attachment` | stored meeting parts, using integer ids and epoch millisecond timestamps |
| `TranscriptLine`, `SourceMeeting`, `SourceChatLine`, `SummaryContent` | data returned by the parser and source before storage |
| `parseVtt` | WebVTT cues in file order, with the speaker taken from a `Name: text` cue |
| `MeetingSource` | what a provider implements: meetings, transcript, chat and summary |

Transcript rows are keyed by transcript and position. Store fields follow the shared store schema;
attachments point at meetings through `attachableType` and `attachableId`.

## Releasing

`bin/release` on a clean `main` publishes the version in `package.json` through GitHub Actions and
tags it; `bin/release --local` publishes from this machine with the npm token from the keyring. When
npm already has the version, it commits the next free one and publishes that. The first publish is
different: [`docs/dev/RELEASING.md`](docs/dev/RELEASING.md).

## Licence

MIT.

## Store adapters and tests

`MeetingStore` is the port implemented by the shared store. The package has no database dependency.
A save takes the meeting and all available parts in one transaction; absent parts preserve history.

```ts
import { meetingStoreContract, memoryMeetingStore } from "@wirecat/cli-meetings/testing"

for (const test of meetingStoreContract(memoryMeetingStore)) await test.run()
```

For a database adapter, pass a factory returning a fresh empty store for each case; your runner owns
closing and removing its temporary database. The contract uses Node assertions and no test runner.
The memory store searches by case-insensitive substring; production indexing belongs to the adapter.

## Pull and import

A `MeetingSource` names its provider and source, lists occurrences since an ISO timestamp, and returns
participants, transcript cues, chat, summary and file pointers for each occurrence. Return null for a
part the source cannot provide. `pull(source, store, { accountId })` uses the account cursor or a
30-day window; pass `since` to choose the window and `now` for deterministic runs.

`importFiles([{ meeting, content }], store)` parses WebVTT content the caller already read. The caller
supplies occurrence metadata and may provide participants. Reports include counts and warnings.
Failed occurrences keep the pull cursor unchanged. Cues whose name has zero or multiple participant
matches keep the name with no speaker id. Corrections retain the previous transcript version.

## Commands and MCP

`@wirecat/cli-meetings/cli` exports `addMeetingCommands(program, deps)` for a Commander program. Pass
`store`, `accountId`, `write(value, format)`, and optionally `source`, `readFiles(folder)` and `now()`.
The host reads folders and renders text, JSON or JSONL; it also handles errors and exit codes.

| Command | Reads or changes |
|---|---|
| `meetings list [--since <date>] [--until <date>] [--limit <n>] [--page <n>]` | a page of stored meetings |
| `meetings show <meeting>` | one meeting with its parts |
| `meetings transcript <meeting>` | current transcripts |
| `meetings search <query>` | stored transcript, chat and summary text |
| `meetings people <query>` | participants by name or email |
| `meetings pull [--since <date>]` | fetch and save the selected account's records |
| `meetings import <folder>` | parse and save downloaded transcripts |
| `events list` | stored events |

All commands accept `--json` or `--jsonl`. Lists return `{ items, page, limit, hasMore }`; the host
streams their items for JSONL. Meeting ids are store ids. Show and transcript respect the selected
account. Groups show help; they do not run a default action.

`@wirecat/cli-meetings/mcp` exports `meetingTools` (schemas and read annotations) and
`callMeetingTool(store, name, arguments)`. A server registers these tools and delegates its calls.
The tools are `meetings_list`, `meeting_show`, `meeting_transcript`, `meetings_search` and
`meeting_people`. Fields use snake case; list filters use epoch millisecond `since` and `until`.
Unknown fields, invalid values and missing arguments return a structured error before any read.

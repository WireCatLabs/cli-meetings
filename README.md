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
| `exportMeeting`, `serializeVtt` | pure Markdown and WebVTT exports of stored meeting content |
| `listed` | the shared list envelope for an unpaged result |
| `watchMeetingIngestion` | a cancellable foreground loop yielding one receipt per completed ingestion |
| `MeetingSource` | what a provider implements: meetings, transcript, chat and summary |

Transcript rows are keyed by transcript and position. Store fields follow the shared store schema;
attachments point at meetings through `attachableType` and `attachableId`.

## Releasing

`bin/release` on a clean `main` publishes the version in `package.json` through GitHub Actions and
tags it; `bin/release --local` publishes from this machine with the npm token from the keyring. When
npm already has the version, it commits the next free one and publishes that. The first publish is
different: [`docs/dev/RELEASING.md`](docs/dev/RELEASING.md).

## Licence

[Apache License 2.0](LICENSE).

## Store adapters and tests

`MeetingStore` is the port implemented by the shared store. The package has no database dependency.
A save takes the meeting and all available parts in one transaction; absent parts preserve history.

```ts
import { meetingStoreContract, memoryMeetingStore } from "@wirecat/cli-meetings/testing"

for (const test of meetingStoreContract(memoryMeetingStore)) await test.run()
```

For a database adapter, pass a factory returning a fresh empty store for each case; your runner owns
closing and removing its temporary database. Seed usable invented accounts with ids 1 and 2 before
each case; meetings and events start empty. The contract uses Node assertions and no test runner.
The memory store searches by case-insensitive substring; production indexing belongs to the adapter.

`IdentityInput.associatePerson` explicitly marks a stable provider identity for person association.
An absent or false marker keeps an occurrence-specific identity detached; adapters must preserve any
existing owner association. Pull marks concrete provider, email or registrant keys and leaves guest
fallback keys detached. The marker does not authorize merging people by name or across email matches.

`MeetingTranscriptStore` is a separate optional capability for atomic transcript-only appends. It
does not add a required method to `MeetingStore`. `appendTranscripts` selects an occurrence by account
id and external id, preserves its fields and unrelated parts, and requires explicit creation metadata
when it does not exist. Deleted occurrences reject with `not_found` and are never recreated.
Rows retain speaker names without participant links. Each asset requires a stable source and content
hash; replaying a retained historical hash never reactivates its superseded version. An invalid asset
rolls back the whole batch. The operation does not change the account cursor or create events.

`meetingTranscriptStoreContract` from the testing entry point checks this capability with a fresh
adapter factory. The memory adapter implements it; a production adapter must explicitly implement
the capability before a consumer uses it. The published SQLite adapter in cli-messaging 0.218.0
does not yet implement it.

## Pull and import

A `MeetingSource` names its provider and source, lists occurrences since an ISO timestamp, and returns
participants, transcript cues, chat, summary and file pointers for each occurrence. Return null for a
part the source cannot provide. Set `transcriptFormat` when the source knows the original format;
otherwise normalized API cues keep their format unknown. `pull(source, store, { accountId })` uses the account cursor or a
30-day window; pass `since` to choose the window and `now` for deterministic runs. An optional
`lookbackMs` (zero through 31 days, default zero) subtracts from that boundary so recent occurrences
are revisited for late transcripts. Parts appearing outside the window require an older `since`.

`importFiles([{ meeting, content }], store)` parses WebVTT content the caller already read. The caller
supplies occurrence metadata and may provide participants. Reports include counts and warnings.
Failed occurrences keep the pull cursor unchanged. Cues whose name has zero or multiple participant
matches keep the name with no speaker id. Corrections retain the previous transcript version.

## Commands and MCP

`@wirecat/cli-meetings/cli` exports `addMeetingCommands(program, deps)` for a Commander program. Pass
`store`, `accountId`, `write(value, format)`, and optionally `source`, `readFiles(folder)`,
`writeFile(path, content)` and `now()`.
The host reads folders and renders text, JSON or JSONL; it also handles errors and exit codes.
Set `rootIngestion: true` to mount `pull` and `import` at the program root.

| Command | Reads or changes |
|---|---|
| `meetings list [--since <date>] [--until <date>] [--limit <n>] [--page <n>]` | a page of stored meetings |
| `meetings show <meeting>` | one meeting with its parts |
| `meetings transcript <meeting> [--history]` | current transcripts or retained versions that were not deleted |
| `meetings summary <meeting>` | stored summaries |
| `meetings export <meeting> [--format markdown\|vtt] [--transcript-id <id>] [--output <file>]` | export meeting content or a selected transcript version |
| `meetings search <query> [--since <date>] [--until <date>] [--event-id <id>] [--series-id <id>]` | stored text filtered by meeting date, event or series |
| `meetings people <query>` | participants by name or email |
| `meetings pull [--since <date>] [--lookback-days <days>]` | fetch and save the selected account's records |
| `meetings import <folder>` | parse and save downloaded transcripts |
| `events list` | stored events |

Pull accepts `--lookback-days` as an integer from zero through 31, default zero. It subtracts those
days from the account cursor, the default 30-day boundary or an explicit `--since`. For example,
`zm pull --lookback-days 7` revisits the previous seven days of the discovery window for late parts.
It keeps the same retry and transcript deduplication guarantees as ordinary pull.

All commands accept `--json` or `--jsonl`. Lists return `{ items, page, limit, hasMore }`; the host
streams their items for JSONL. Meeting ids are store ids. Show and transcript respect the selected
account, as do summary and export. Groups show help; they do not run a default action.

Exports return `{ meetingId, format, filename, content }`. With `--output`, the host's writer receives
the content and success returns a receipt after the write succeeds. The shared package never opens
a file. VTT exports regenerate normalized cues rather than reproducing the original source file;
markup characters are escaped. Multiple current transcripts require `--transcript-id`; a selected
superseded version remains exportable. Invalid cue timing, decreasing start times, control characters
or blank cue paragraphs are refused instead of silently changing content. Markdown exports make
controls visible and render retrieved Markdown syntax as text. Shared sanitizers require a host
installation of `@wirecat/cli-core` 0.18.1 through 0.19.x.

`@wirecat/cli-meetings/mcp` exports `meetingTools` (schemas and read annotations) and
`callMeetingTool(store, name, arguments)`. A server registers these tools and delegates its calls.
The tools are `meetings_list`, `meeting_show`, `meeting_transcript`, `meeting_summary`,
`meeting_export`, `meetings_search` and `meeting_people`. Export returns content and never writes a
file. Show/transcript/summary/export accept `account_id`; transcript accepts `history`. List and
search support `event_id` and `series_id`. Fields use snake case; date filters use epoch millisecond
`since` and `until`.
Unknown fields, invalid values and missing arguments return a structured error before any read.

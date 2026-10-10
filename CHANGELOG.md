# Changelog

Notable changes to `@wirecat/cli-meetings`, one section per version, newest first. Versions follow
[semantic versioning](https://semver.org/); before `1.0.0` a minor release may change the API.

Every entry says what changed as a caller sees it, why, and what to watch for — the rules are
[`docs/dev/CONVENTIONS.md`](docs/dev/CONVENTIONS.md#the-changelog).

## 0.2.5 — 10.10.2026

### Added

- **Optional atomic transcript appends** define a separate `MeetingTranscriptStore` capability and
  portable adapter contract. Source/hash replay preserves history; batches preserve owner fields,
  unrelated parts and cursors, refuse deleted occurrences, and keep speaker names unlinked.
  The memory adapter implements it. Production adapters must opt in before consumers can use it.

## 0.2.4 — 10.10.2026

### Added

- **Summary, history and export reads** expose stored summaries, retained transcript versions and
  Markdown/WebVTT exports through shared services, commands and read-only MCP tools. File output
  uses an injected host writer; exports respect the selected account and require explicit selection
  when several current transcripts could produce VTT. The public `listed` helper reuses list envelopes.
  Search accepts meeting date, event and series filters.
- **Foreground ingestion watching** yields completed receipts without overlapping cycles. The caller
  supplies ingestion, cancellation and resource ownership; intervals range from one second to one day.
  Failures propagate, including uncertain outcomes after cancellation.

### Changed — may break callers

- **Shared text sanitization** requires cli-core 0.18.1 through 0.19.x as a peer. Markdown makes
  controls visible; VTT refuses unrepresentable content or invalid cue ordering. Development tooling
  now uses the WireCat cli-core package.

### Security

- Fast secret checks remain on PRs; source, production dependency and workflow security checks run before publication. Automatic Socket checks are disabled.

## 0.2.3 — 10.10.2026

### Added

- Pull commands accept `--lookback-days <days>` (integer zero through 31, default zero), making
  recent occurrence retries for late transcripts available from the CLI. The window subtracts from
  the account cursor, default boundary or explicit `--since`; invalid bounds fail before discovery.

## 0.2.2 — 10.10.2026

### Changed — may break callers

- **The project is now licensed under Apache License 2.0.** See `LICENSE` for the terms.

## 0.2.1 — 10.10.2026

### Fixed

- MCP reads return a safe generic error for unexpected store failures. Read filters reject invalid
  ranges and unsafe pagination. Event linking checks the current stored link and returns the actual
  link when a concurrent owner update wins.

### Added

- Pull accepts an explicit `lookbackMs` from zero through 31 days to revisit recent occurrences for
  late transcripts. The default remains zero; older occurrences require an explicit `since`.

## 0.2.0 — 10.10.2026

### Added

- **`./cli` and `./mcp`** expose meeting commands and read tools over the same reads. Command hosts
  supply a file reader and output writer; MCP tools validate arguments and return structured results.

- **Pull, import and event linking.** Fetch available occurrence parts in order, parse caller-supplied
  WebVTT files, preserve ambiguous speaker names and match events by series or join link plus time.
  Failed occurrences are warnings and keep the cursor available for retry.

- **`./testing`** exports an in-memory store, a fake source, invented sample records and
  runner-independent `meetingStoreContract(make)` cases for adapter validation.

- **`MeetingStore`** defines atomic meeting saves, retained transcript versions, reads, search,
  participant lookup, event linking and account pull cursors. Store adapters implement this port.

### Changed — may break callers

- **Node 22.12 or newer** is required by the command parser dependency.
- **`MeetingSource`** now names the source and provides participants and file pointers. Implement
  both methods, returning null when unavailable; source meetings may have no series.
- **The stored model** now includes events, participants, transcripts, rows and attachments, using
  integer ids and epoch millisecond timestamps to match the shared store. Provider data uses
  `SourceMeeting`, `SourceChatLine` and `SummaryContent`; update source implementations to these types.
- **`lineId` removed.** Transcript rows are keyed by transcript and position, preserving separate
  cues even when they start at the same time. Use `TranscriptRow.position` when storing parsed cues.

### Fixed

- **Event matching with an unknown end** treats the event as its start instant, so a second record
  of the same call can link without guessing its duration.
- **Transcript formats** come from the source's optional `transcriptFormat`; normalized API cues
  without a declared format keep it unknown. WebVTT imports retain their known format.

## 0.1.0 — 09.10.2026

### Added

- **The meeting model.** A series and its occurrences; transcript lines, chat lines and the
  provider's summary, each belonging to one occurrence.
- **`parseVtt`** reads a WebVTT file into transcript lines and takes the speaker from a
  `Name: text` cue, as Zoom writes it in its API transcripts and in downloaded files. A file that is
  not WebVTT, or a cue with a broken timestamp, throws `VttError` naming the line.
- **`lineId`** keys a line by its occurrence and start time, so a transcript imported twice updates
  its lines instead of doubling them.
- **`MeetingSource`**, the port a provider implements.

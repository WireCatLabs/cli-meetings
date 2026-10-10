# Changelog

Notable changes to `@wirecat/cli-meetings`, one section per version, newest first. Versions follow
[semantic versioning](https://semver.org/); before `1.0.0` a minor release may change the API.

Every entry says what changed as a caller sees it, why, and what to watch for — the rules are
[`docs/dev/CONVENTIONS.md`](docs/dev/CONVENTIONS.md#the-changelog).

## Unreleased

### Added

- **Pull, import and event linking.** Fetch available occurrence parts in order, parse caller-supplied
  WebVTT files, preserve ambiguous speaker names and match events by series or join link plus time.
  Failed occurrences are warnings and keep the cursor available for retry.

- **`./testing`** exports an in-memory store, a fake source, invented sample records and
  runner-independent `meetingStoreContract(make)` cases for adapter validation.

- **`MeetingStore`** defines atomic meeting saves, retained transcript versions, reads, search,
  participant lookup, event linking and account pull cursors. Store adapters implement this port.

### Changed — may break callers

- **`MeetingSource`** now names the source and provides participants and file pointers. Implement
  both methods, returning null when unavailable; source meetings may have no series.

- **The stored model** now includes events, participants, transcripts, rows and attachments, using
  integer ids and epoch millisecond timestamps to match the shared store. Provider data uses
  `SourceMeeting`, `SourceChatLine` and `SummaryContent`; update source implementations to these types.
- **`lineId` removed.** Transcript rows are keyed by transcript and position, preserving separate
  cues even when they start at the same time. Use `TranscriptRow.position` when storing parsed cues.

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

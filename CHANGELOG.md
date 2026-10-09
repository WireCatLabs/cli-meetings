# Changelog

Notable changes to `@wirecat/cli-meetings`, one section per version, newest first. Versions follow
[semantic versioning](https://semver.org/); before `1.0.0` a minor release may change the API.

Every entry says what changed as a caller sees it, why, and what to watch for — the rules are
[`docs/dev/CONVENTIONS.md`](docs/dev/CONVENTIONS.md#the-changelog).

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

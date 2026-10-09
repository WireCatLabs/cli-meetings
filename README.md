# @wirecat/cli-meetings

The shared layer for meeting tools, as `cli-messaging` is for messenger tools: one model for meetings,
their transcripts, chat and summaries, a WebVTT parser, and the port each meeting provider implements.
The first provider is Zoom, through `zoom-cli`. What is planned next is in
[`docs/dev/ROADMAP.md`](docs/dev/ROADMAP.md); what changed in each version is in
[`CHANGELOG.md`](CHANGELOG.md).

```ts
import { lineId, parseVtt } from "@wirecat/cli-meetings"

const lines = parseVtt("WEBVTT\n\n00:00:01.500 --> 00:00:04.000\nAlice Example: Shall we start?\n")
// [{ startMs: 1500, endMs: 4000, speaker: "Alice Example", text: "Shall we start?" }]
lineId("occurrence-1", lines[0]) // "occurrence-1@1500"
```

## What is in it

| | |
|---|---|
| `MeetingSeries`, `Occurrence` | a meeting and each time it met; transcripts, chat and summaries belong to an occurrence |
| `TranscriptLine`, `ChatLine`, `Summary` | what a provider hands over for an occurrence |
| `parseVtt` | WebVTT cues as transcript lines, with the speaker taken from a `Name: text` cue, as Zoom writes it |
| `lineId` | a line's key from its occurrence and start time, so importing a transcript again updates it |
| `MeetingSource` | what a provider implements: `meetings(since)`, `transcript`, `chat` and `summary` of an occurrence |

## Releasing

`bin/release` on a clean `main` publishes the version in `package.json` through GitHub Actions and
tags it; `bin/release --local` publishes from this machine with the npm token from the keyring. When
npm already has the version, it commits the next free one and publishes that. The first publish is
different: [`docs/dev/RELEASING.md`](docs/dev/RELEASING.md).

## Licence

MIT.

# Architecture

Published as `@wirecat/cli-meetings`. Each meeting provider is its own package that implements
`MeetingSource`; the shared store implements `MeetingStore`; this package owns everything between them.

## Events and meetings

An **event** is the owner's own record of something that happened, as a **person** is the owner's own
record of someone. A **meeting** is what one external app knows about it: a Zoom occurrence, a
Fireflies recording. Several meetings can point at one event, as several identities point at one
person. Later a calendar entry points at the same event.

```text
persons ◄── identity_links ── identities (a Zoom user, a Telegram user, …)
                                   ▲ meeting_participants
event_series ◄── events ◄── meetings ── transcripts → utterances, chat, summaries, documents
                     ▲
                     └── later: calendar entries
```

## Who depends on whom

```text
cli-core ← cli-meetings ← cli-messaging ← zoom-cli (zm)
```

- **cli-meetings** — the model, the WebVTT parser, the two ports, and what runs on them: pull, import,
  event linking, the commands and the MCP read tools. No SQLite, no filesystem; the lint rule in
  [`biome.json`](../../biome.json) refuses them under `src/`.
- **cli-messaging** — the tables, in its single list of store migrations, and `MeetingStore` over SQLite,
  as it already does for cli-tasks' `TaskStore`. It runs no meeting logic.
- **A provider** (`zoom-cli` first) — login, the API client, and one `MeetingSource` per way in: `api`,
  `files`, `browser`. It opens the shared store through cli-messaging and hands both ports to the
  commands here.

## The modules

| File | What |
|---|---|
| [`src/model.ts`](../../src/model.ts) | `MeetingSeries`, `Occurrence`, `TranscriptLine`, `ChatLine`, `Summary` |
| [`src/vtt.ts`](../../src/vtt.ts) | `parseVtt`: WebVTT cues to transcript lines, the speaker taken from `Name: text` |
| [`src/source.ts`](../../src/source.ts) | `MeetingSource`, the port a provider implements |

Next: participants, documents and events in the model; `MeetingStore` and an in-memory store for
tests; pull, import and event linking; then the commands and MCP tools.

## The tables

In the shared store, created by cli-messaging. Times are epoch milliseconds. Every table that holds a
provider's record has `provider_metadata`, JSON, for whatever has no column yet.

| Table | One row is |
|---|---|
| `events` | the owner's event: title, start, end, time zone, whether a pull or the owner made it |
| `event_series` | a repeating event, above any one provider's recurrence |
| `meeting_series` | a provider's recurring or scheduled meeting: title, kind, recurrence, host, join link |
| `meetings` | one occurrence: start, end, duration, host, and the event it belongs to |
| `meeting_participants` | one person in one meeting: their identity, the name and email shown in that meeting, role, joins and leaves |
| `meeting_transcripts` | one transcript of a meeting: its source, format, language and content hash |
| `meeting_utterances` | one line of a transcript: start, end, speaker, text |
| `meeting_chat_messages` | one message of the in-meeting chat |
| `meeting_summaries` | one summary: title, overview, sections, next steps, the full text, which tool made it |
| `meeting_documents` | one file a meeting has: a recording, a shared file, a whiteboard — a pointer, not the file |

Meeting text gets its own word and stem indexes, built the way the notes' are, so a query means the same
for messages, notes and meetings.

## Rules the tables keep

1. **Nothing is lost.** A pull never deletes. What a provider stops returning is marked gone; a
   transcript whose text changed is a new transcript, and the old one stays.
2. **A participant is an identity, not a contact.** Keyed by the provider's user id, else email, else a
   name that counts only inside its meeting, so two strangers with one name never merge. The name shown
   in each meeting stays with that meeting. A contact is someone with a one-to-one chat, which a meeting
   never creates; the owner links a participant to a person when it is the same human.
3. **Sources point at events; events point at nothing.** That is what lets a calendar, or a second
   meeting app, join later without changing the meeting tables.
4. **Meetings are not messages.** Messages are for messengers; meetings, their lines and their chat live
   in their own tables.

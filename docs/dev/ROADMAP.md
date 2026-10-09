# Roadmap

`@wirecat/cli-meetings` is the shared layer for meeting tools, as `cli-messaging` is for messenger
tools: one model for meetings, their transcripts, chats, summaries and notes, kept in the same local
store the messenger CLIs use, so one search and one person's context cover messages and meetings.

## Now

- **The foundation**: the package, its tooling, CI and release, the meeting model, and the source
  port every provider implements.
- **First provider: Zoom**, through `zoom-cli` (`zm`). Zoom's official API (OAuth with PKCE, no
  client secret) for meetings the user hosted, and an import of WebVTT transcript files for the rest.

## Next

- **Google Meet** — transcripts and recordings from Google Workspace.
- **Microsoft Teams** — transcripts and meeting chat through Microsoft Graph.
- **Meeting-assistant bots** that already transcribe and summarise — Fireflies and similar services —
  read through their APIs as one more source.
- **A browser source** for Zoom, for accounts whose admin does not approve the app and for meetings
  the user only attended.

Each one is a source behind the same port; nothing above the port changes when one is added.

## Later

- **Calendars** — Google Calendar and others, probably as a `cli-calendar` package. A calendar entry is
  one more source for an event, next to the meetings: it points at the same event, its invitees are
  identities like meeting participants, and a recurring entry points at the same event series. Nothing
  for calendars is built yet; the event tables are shaped so that adding them changes no meeting code.

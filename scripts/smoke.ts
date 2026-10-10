/**
 * The second runtime, actually executed: `bun test` cannot run the Vitest suite, so this drives the
 * real exports with plain assertions under Bun.
 *
 *   bun run scripts/smoke.ts
 */
import { strict as assert } from "node:assert"
import { parseVtt } from "../src/index.ts"

const [line] = parseVtt("WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nAlice Example: hello\n")
assert.ok(line)
assert.deepEqual(line, { startMs: 1000, endMs: 2000, speaker: "Alice Example", text: "hello" })
console.log("smoke: ok")

import { fakeMeetingSource, meetingStoreContract, memoryMeetingStore } from "../src/testing/index.ts"

for (const test of meetingStoreContract(memoryMeetingStore)) await test.run()
assert.equal(fakeMeetingSource().provider, "example")

import {
  exportMeeting,
  importFiles,
  linkEvent,
  listed,
  pull,
  serializeVtt,
  watchMeetingIngestion,
} from "../src/index.ts"

const store = memoryMeetingStore()
assert.equal((await pull(fakeMeetingSource(), store, { accountId: 1, now: 4000 })).meetings, 1)
assert.ok(linkEvent)
assert.equal((await importFiles([], store)).meetings, 0)
assert.deepEqual(listed(["example"]), { items: ["example"], page: 1, limit: 1, hasMore: false })
const controller = new AbortController()
let cycles = 0
for await (const receipt of watchMeetingIngestion(
  async () => {
    cycles += 1
    return importFiles([], store)
  },
  { signal: controller.signal, intervalMs: 1000 },
)) {
  assert.equal(receipt.meetings, 0)
  controller.abort()
}
assert.equal(cycles, 1)
assert.ok(serializeVtt([{ startMs: 0, endMs: 1000, speaker: null, text: "Example" }]).startsWith("WEBVTT"))
const archived = (await store.meetings())[0]
assert.ok(archived)
assert.ok((await exportMeeting(store, archived.id, { format: "markdown" })).content.includes("Transcript"))

import { addMeetingCommands } from "../src/cli/index.ts"
import { callMeetingTool, meetingTools } from "../src/mcp/index.ts"

assert.ok(addMeetingCommands)
assert.equal(meetingTools.length, 7)
assert.equal((await callMeetingTool(store, "meetings_list", {})).isError, undefined)
assert.equal(
  (await callMeetingTool(store, "meeting_export", { meeting: archived.id, format: "vtt" })).isError,
  undefined,
)

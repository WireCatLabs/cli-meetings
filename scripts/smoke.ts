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

import { importFiles, linkEvent, pull } from "../src/index.ts"

const store = memoryMeetingStore()
assert.equal((await pull(fakeMeetingSource(), store, { accountId: 1, now: 4000 })).meetings, 1)
assert.ok(linkEvent)
assert.equal((await importFiles([], store)).meetings, 0)

/**
 * The second runtime, actually executed: `bun test` cannot run the Vitest suite, so this drives the
 * real exports with plain assertions under Bun.
 *
 *   bun run scripts/smoke.ts
 */
import { strict as assert } from "node:assert"
import { lineId, parseVtt } from "../src/index.ts"

const [line] = parseVtt("WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nAlice Example: hello\n")
assert.ok(line)
assert.deepEqual(line, { startMs: 1000, endMs: 2000, speaker: "Alice Example", text: "hello" })
assert.equal(lineId("occ-1", line), "occ-1@1000")
console.log("smoke: ok")

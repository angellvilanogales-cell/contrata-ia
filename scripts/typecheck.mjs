#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["tsc", "-p", "tsconfig.json", "--noEmit", "--pretty", "false"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
if (result.status === 0) {
  console.log("TypeScript: PASS");
  process.exit(0);
}

const lines = output.split(/\r?\n/).filter(Boolean);
console.error(`TypeScript: FAIL (${lines.length} líneas de diagnóstico)`);
for (const line of lines.slice(0, 80)) console.error(line);
if (lines.length > 80) console.error(`... ${lines.length - 80} líneas adicionales omitidas del log.`);
process.exit(result.status ?? 1);

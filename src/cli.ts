#!/usr/bin/env bun

import { run } from "./index";

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const out: Record<string, any> = { _: [] };
  let key: string | null = null;
  for (const a of args) {
    if (a === "--") break;
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=", 2);
      if (v !== undefined) out[k] = v;
      else key = k;
    } else if (a.startsWith("-")) {
      const flags = a.slice(1).split("");
      for (const f of flags) out[f] = true;
    } else if (key) {
      out[key] = a; key = null;
    } else {
      out._.push(a);
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const cmd = (args._[0] as string | undefined) ?? "help";
  await run(cmd, args);
}

main().catch((err) => {
  console.error("CapybaraCLI error:", err?.stack ?? err);
  process.exit(1);
});

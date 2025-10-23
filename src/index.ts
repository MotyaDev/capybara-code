import { ensureConfig, loadConfig, writeDefaultConfig } from "./core/config";
import { logger } from "./core/logger";
import { type ChatProvider, resolveProvider } from "./providers";
import { startRepl } from "./chat/repl";
import { ChatSession } from "./chat/session";

function printHelp() {
  console.log(`CapybaraCLI

Usage:
  capybara <command> [options]

Commands:
  help                  Show help
  version               Show version
  init                  Initialize .capybara/config.json
  repl                  Start interactive chat (default)
  chat --model <m> --prompt <p>   One-off prompt (provider stub)
`);
}

async function cmdVersion() {
  const pkg = await Bun.file(new URL("../package.json", import.meta.url)).json();
  console.log(pkg.name, pkg.version);
}

async function cmdInit() {
  await ensureConfig();
  const created = await writeDefaultConfig();
  if (created) logger.info("Initialized .capybara/config.json");
  else logger.info("Config already exists at .capybara/config.json");
}

async function cmdChat(args: Record<string, any>) {
  await ensureConfig();
  const cfg = await loadConfig();
  const model = (args.model as string | undefined) ?? cfg.defaultModel;
  const prompt = (args.prompt as string | undefined) ?? "Say hi from Capybara";

  if (!model) {
    logger.error("No model specified. Use --model <provider:model-id> or set defaultModel in config");
    return;
  }

  const provider: ChatProvider = resolveProvider(model, cfg);
  const res = await provider.chat({ model, messages: [
    { role: "user", content: prompt }
  ]});

  process.stdout.write((res.text ?? "") + "\n");
}

async function cmdRepl(args: Record<string, any>) {
  await ensureConfig();
  const cfg = await loadConfig();
  const model = (args.model as string | undefined) ?? cfg.defaultModel ?? "mock:capybara";
  const provider: ChatProvider = resolveProvider(model, cfg);
  const session = new ChatSession(provider, model);
  await startRepl({ session });
}

export async function run(cmd: string, args: Record<string, any>) {
  switch (cmd) {
    case "help":
    case undefined:
      await cmdRepl(args);
      break;
    case "version":
      await cmdVersion();
      break;
    case "init":
      await cmdInit();
      break;
    case "chat":
      await cmdChat(args);
      break;
    case "repl":
      await cmdRepl(args);
      break;
    default:
      logger.warn(`Unknown command: ${cmd}`);
      printHelp();
  }
}

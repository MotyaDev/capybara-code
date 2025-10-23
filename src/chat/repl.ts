import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { ChatSession } from "./session";
import { logger } from "../core/logger";
import { bold, dim, gray, color256 } from "../utils/ansi";

export interface ReplOptions {
  session: ChatSession;
}

function printBanner() {
  const orange = (s: string) => color256(208, s);
  const title = `${orange("✱")} Welcome to CapybaraCLI research preview!`;
  const width = 62;
  
  // Beautiful bordered box like Claude Code
  const topLine = orange("┌" + "─".repeat(width) + "┐");
  const bottomLine = orange("└" + "─".repeat(width) + "┘");
  const padding = " ".repeat(Math.floor((width - title.length + 10) / 2)); // +10 for ANSI codes
  const titleLine = orange("│") + padding + title + " ".repeat(width - padding.length - title.length + 10) + orange("│");
  
  output.write("\n" + topLine + "\n");
  output.write(titleLine + "\n");
  output.write(bottomLine + "\n\n");
  output.write(`• ${bold("Hi!")} What can I help you with today?\n\n`);
}

function printHelp() {
  const help = `Commands:
  /help            Show this help
  /model <name>    Set model (e.g. openai:gpt-4o-mini)
  /clear           Clear chat history
  /exit            Exit chat
`;
  output.write(help);
}

export async function startRepl(opts: ReplOptions) {
  printBanner();
  printFooter();

  const rl = readline.createInterface({ 
    input, 
    output, 
    prompt: gray("> "),
    terminal: true 
  });
  rl.prompt();

  rl.on("line", async (line: string) => {
    const text = line.trim();
    if (!text) {
      rl.prompt();
      return;
    }

    if (text.startsWith("/")) {
      const [cmd, ...rest] = text.slice(1).split(/\s+/);
      switch (cmd) {
        case "help":
          printHelp();
          break;
        case "model":
          if (!rest[0]) output.write("Please provide a model name.\n");
          else {
            opts.session.setModel(rest[0]);
            output.write(`Model set to ${rest[0]}\n`);
          }
          break;
        case "clear":
          opts.session.clearHistory();
          output.write("History cleared.\n");
          break;
        case "exit":
        case "quit":
          rl.close();
          return;
        default:
          output.write(`Unknown command: /${cmd}\n`);
      }
      rl.prompt();
      return;
    }

    try {
      const stop = startSpinner("Thinking");
      const answer = await opts.session.ask(text);
      stop();
      output.write(formatResponse(answer) + "\n\n");
    } catch (e: any) {
      logger.error(e?.message ?? String(e));
    }
    rl.prompt();
  });

  rl.on("close", () => {
    output.write("\n" + gray("Goodbye! 👋") + "\n\n");
  });
}

function printFooter() {
  const hints = dim("! for bash mode  •  / for commands  •  tab to undo  •  \\r for newline");
  output.write(hints + "\n");
}

function formatResponse(text: string): string {
  const lines = text.split("\n");
  const formatted = lines.map(line => {
    if (line.trim() === "") return "";
    if (line.startsWith("```")) return dim(line);
    if (line.match(/^[•\-*]\s/)) return "  " + color256(180, line);
    if (line.match(/^\d+\./)) return "  " + color256(180, line);
    if (line.startsWith("`") && line.endsWith("`")) return color256(180, line);
    return line;
  });
  return "\n" + formatted.join("\n");
}

function startSpinner(label: string) {
  const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
  let i = 0;
  const timer = setInterval(() => {
    output.write(`\r${color256(244, frames[i % frames.length])} ${dim(label)}...  `);
    i++;
  }, 80);
  return () => {
    clearInterval(timer);
    output.write("\r" + " ".repeat(40) + "\r");
  };
}

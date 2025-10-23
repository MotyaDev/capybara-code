import { logger } from "./logger";
import { type AppConfig } from "./types";

const CONFIG_DIR = ".capybara";
const CONFIG_PATH = `${CONFIG_DIR}/config.json`;

export async function ensureConfig() {
  // Ensure directory exists; do not create/overwrite config file here
  // Using Node fs to reliably create directories across platforms
  const { mkdir } = await import("node:fs/promises");
  await mkdir(CONFIG_DIR, { recursive: true });
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    const file = Bun.file(CONFIG_PATH);
    if (!(await file.exists())) return {};
    const json = await file.json();
    return json as AppConfig;
  } catch (e) {
    logger.warn("Failed to parse config; using defaults");
    return {};
  }
}

export async function writeDefaultConfig(): Promise<boolean> {
  // Create folder if needed and write a default config only if it doesn't exist
  const { mkdir } = await import("node:fs/promises");
  await mkdir(CONFIG_DIR, { recursive: true });

  const file = Bun.file(CONFIG_PATH);
  if (await file.exists()) return false;

  try {
    await Bun.write(
      CONFIG_PATH,
      JSON.stringify(
        {
          defaultModel: "mock:capybara",
          providers: {
            openai: {
              apiKeyEnv: "OPENAI_API_KEY",
              baseURL: "https://api.openai.com/v1",
            },
          },
        },
        null,
        2
      ) + "\n"
    );
    return true;
  } catch (e) {
    return false;
  }
}

export { CONFIG_PATH };

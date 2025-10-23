import { type ChatMessage } from "../core/types";
import { type ChatProvider } from "../providers";

export class ChatSession {
  private messages: ChatMessage[] = [];
  private provider: ChatProvider;
  private model: string;

  constructor(provider: ChatProvider, model: string) {
    this.provider = provider;
    this.model = model;
  }

  setModel(model: string) { this.model = model; }
  getModel() { return this.model; }
  getHistory() { return [...this.messages]; }
  clearHistory() { this.messages = []; }

  async ask(prompt: string): Promise<string> {
    this.messages.push({ role: "user", content: prompt });
    const res = await this.provider.chat({ model: this.model, messages: this.messages });
    const text = res.text ?? "";
    this.messages.push({ role: "assistant", content: text });
    return text;
  }
}

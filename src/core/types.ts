export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  text: string;
}

export interface ProviderConfig {
  apiKeyEnv?: string;
  baseURL?: string;
}

export interface AppConfig {
  defaultModel?: string;
  providers?: Record<string, ProviderConfig>;
}

import { type AppConfig, type ChatRequest, type ChatResponse } from "../core/types";

export interface ChatProvider {
  chat(req: ChatRequest): Promise<ChatResponse>;
}

class EchoProvider implements ChatProvider {
  async chat(req: ChatRequest): Promise<ChatResponse> {
    const user = req.messages.find(m => m.role === "user");
    return { text: `🐹 Capybara (echo, model=${req.model}): ${user?.content ?? ""}` };
  }
}

class MockProvider implements ChatProvider {
  private counter = 0;

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const user = [...req.messages].reverse().find(m => m.role === "user");
    const q = (user?.content ?? "").trim().toLowerCase();
    if (!q) return { text: "Hi! Ask me anything about code, tools, or ideas." };

    this.counter++;

    // Greetings
    if (/^(привет|hi|hello|hey|здравствуй|хай)/.test(q)) {
      return { text: "Привет! 👋 Чем могу помочь?" };
    }

    // How are you / как дела
    if (/как дела|how are you|как ты/.test(q)) {
      return { text: "Отлично! Готов помочь с кодом, инструментами или идеями. Что интересует?" };
    }

    // Fix/error/lint/bug
    if (/fix|error|lint|bug|ошибк|исправ|баг/.test(q)) {
      return {
        text: `Помогу исправить! Вот что я рекомендую:

1. Сначала изолируем проблему
2. Проверим логи и стек ошибок
3. Применим минимальный фикс
4. Добавим тест, чтобы избежать регрессии

Если покажешь код или текст ошибки, смогу дать более точные советы.`
      };
    }

    // Examples / how to / пример
    if (/example|пример|покажи|show|how to|как/.test(q)) {
      if (/http|server|сервер/.test(q)) {
        return {
          text: `Вот простой HTTP-сервер на Bun:

\`\`\`ts
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello from Bun!");
  },
});

console.log("Server running on http://localhost:3000");
\`\`\`

Запусти: \`bun run server.ts\``
        };
      }
      return {
        text: `Вот простой пример TypeScript функции:

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("Capybara")); // Hello, Capybara!
\`\`\`

Что конкретно интересует?`
      };
    }

    // Default varied responses
    const responses = [
      "Интересный вопрос! Могу помочь с кодом или командами. Опиши задачу подробнее?",
      "Я здесь, чтобы помочь! Нужен пример кода, совет по архитектуре или что-то другое?",
      "Давай разберем. Расскажи подробнее, что нужно сделать?",
    ];
    return { text: responses[this.counter % responses.length] };
  }
}

export function resolveProvider(model: string, _cfg: AppConfig): ChatProvider {
  const [provider] = model.split(":", 2);
  switch (provider) {
    case "mock":
      return new MockProvider();
    case "echo":
      return new EchoProvider();
    default:
      // Until real providers are implemented, fall back to echo
      return new EchoProvider();
  }
}

import { PushPal } from "../dist/index.mjs";
import { createMockFetch } from "./_mock-fetch.mjs";

const client = new PushPal({ fetch: createMockFetch() });

const results = await client.group(
  {
    telegram: { token: "BOT_TOKEN", chatId: "123456" },
    bark: { deviceKey: "abcdef123456wxyz" },
    ntfy: { topic: "ops-alerts" },
  },
  {
    title: "Incident",
    body: "Production database connection failed",
    url: "https://monitor.example.com",
  },
);

console.log(results);

import { PushPal } from "../dist/index.mjs";
import { createMockFetch } from "./_mock-fetch.mjs";

const client = new PushPal({ fetch: createMockFetch() });

const results = await client.telegram(
  { token: "BOT_TOKEN", chatId: "123456" },
  {
    title: "Server alert",
    body: "CPU usage is above 90%",
    url: "https://example.com/runbook",
    buttonText: "View runbook",
  },
);

console.log(results);

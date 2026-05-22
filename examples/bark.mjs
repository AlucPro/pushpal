import { PushPal } from "../dist/index.mjs";
import { createMockFetch } from "./_mock-fetch.mjs";

const client = new PushPal({ fetch: createMockFetch() });

const results = await client.bark(
  { deviceKey: "abcdef123456wxyz" },
  {
    title: "Reminder",
    body: "Drink water",
    level: "timeSensitive",
    sound: "minuet",
  },
);

console.log(results);

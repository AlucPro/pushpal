import { PushPal } from "../dist/index.mjs";
import { createMockFetch } from "./_mock-fetch.mjs";

const client = new PushPal({ fetch: createMockFetch() });

const results = await client.ntfy(
  { topic: "ops-alerts" },
  {
    title: "Deploy complete",
    body: "v0.3 is live",
    priority: 4,
    tags: ["white_check_mark"],
  },
);

console.log(results);

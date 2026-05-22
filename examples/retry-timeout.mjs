import { PushPal } from "../dist/index.mjs";
import { createMockFetch } from "./_mock-fetch.mjs";

const client = new PushPal({
  fetch: createMockFetch({ failTimes: 1 }),
  retry: 2,
  timeout: 5000,
});

const results = await client.ntfy(
  { topic: "ops-alerts" },
  {
    title: "Retry example",
    body: "The first request fails, then retry succeeds.",
  },
);

console.log(results);

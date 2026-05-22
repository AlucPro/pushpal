import { PushPal } from "../dist/index.mjs";
import { createMockFetch } from "./_mock-fetch.mjs";

const client = new PushPal({
  fetch: createMockFetch(),
});

const results = await client.ntfy(
  { topic: "my-alerts" },
  {
    title: "pushpal example",
    body: "Hello from ESM",
  },
);

console.log(results);

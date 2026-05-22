# pushpal

Cross-platform mobile notifications for Node.js via Telegram Bot, Bark and Ntfy.

Zero runtime dependencies. One simple API. Multiple mobile notification channels.

中文：`pushpal` 是一个 Node-first 的轻量级 JavaScript 通知 SDK，用统一 API 向 Telegram Bot、Bark 和 Ntfy 发送移动端通知。

## Install

```sh
npm install pushpal
```

Requirements:

- Node.js >= 18
- ESM or CommonJS
- No runtime dependencies

## Quick Start

```js
import { PushPal } from "pushpal";

const client = new PushPal();

const results = await client.ntfy(
  { topic: "my-alerts" },
  {
    title: "Deploy complete",
    body: "v0.3 is live",
  },
);

console.log(results);
```

## Channels

### Telegram Bot

```js
await client.telegram(
  { token: "BOT_TOKEN", chatId: "123456" },
  {
    title: "Server alert",
    body: "CPU usage is above 90%",
    url: "https://example.com/runbook",
    buttonText: "View runbook",
  },
);
```

### Bark

```js
await client.bark(
  { deviceKey: "YOUR_DEVICE_KEY" },
  {
    title: "Reminder",
    body: "Drink water",
    level: "timeSensitive",
    sound: "minuet",
  },
);
```

For a private Bark server:

```js
await client.bark(
  { serverUrl: "https://bark.example.com", deviceKey: "YOUR_DEVICE_KEY" },
  { title: "Hello", body: "From pushpal" },
);
```

### Ntfy

```js
await client.ntfy(
  { topic: "ops-alerts" },
  {
    title: "Deploy complete",
    body: "v0.3 is live",
    priority: 4,
    tags: ["white_check_mark"],
  },
);
```

With private Ntfy auth:

```js
await client.ntfy(
  {
    serverUrl: "https://ntfy.example.com",
    topic: "ops",
    auth: { type: "bearer", token: "tk_xxxxxxxx" },
  },
  { title: "Alert", body: "Disk space is low" },
);
```

## Group Broadcast

Group sends the common message fields (`title`, `body`, `url`) to every configured channel.

```js
await client.group(
  {
    telegram: { token: "BOT_TOKEN", chatId: "123456" },
    bark: { deviceKey: "YOUR_DEVICE_KEY" },
    ntfy: { topic: "ops-alerts" },
  },
  {
    title: "Incident",
    body: "Production database connection failed",
    url: "https://monitor.example.com",
  },
);
```

## Retry And Timeout

Configure retry and timeout globally:

```js
const client = new PushPal({
  retry: 2,
  timeout: 5000,
});
```

Override them per message:

```js
await client.ntfy(
  { topic: "ops-alerts" },
  {
    title: "Alert",
    body: "Retry this send",
    retry: 3,
    timeout: 2000,
  },
);
```

- `retry` is the number of retry attempts after the first failed request.
- `timeout` is measured in milliseconds.
- Network and timeout failures are returned as `SendResult` failures instead of being thrown.

## SendResult

All send methods return `Promise<SendResult[]>`.

```ts
interface SendResult {
  channel: "telegram" | "bark" | "ntfy";
  target: string;
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}
```

Target values are safe for logs:

- Telegram tokens are never returned.
- Bark device keys are masked, for example `bark:key:abcd...wxyz`.
- Ntfy auth credentials are never returned.

## Error Handling

Input errors throw `TypeError` before sending:

- Missing `title` or invalid `body`
- Missing Telegram `token` or `chatId`
- Missing Bark `deviceKey`
- Missing Ntfy `topic`
- Invalid `retry` or `timeout`

Send errors return `SendResult` objects with `ok: false`:

- Network failures
- Timeout failures
- HTTP non-2xx responses
- Response parsing failures

## Browser Security

Do not expose Telegram Bot tokens, Bark device keys, or private Ntfy credentials in browser code.

For browser apps, send notifications through your own backend proxy unless the target topic is intentionally public.

中文提示：不要在前端代码中暴露 Telegram Bot Token、Bark Device Key 或私有 Ntfy 鉴权信息。浏览器应用应通过后端代理发送通知，除非目标 topic 明确是公开的。

## Examples

Runnable offline examples are in `examples/`.

```sh
npm run build
node examples/node-esm.mjs
node examples/node-cjs.cjs
node examples/telegram.mjs
node examples/bark.mjs
node examples/ntfy.mjs
node examples/group.mjs
node examples/retry-timeout.mjs
```

The examples use mock `fetch` functions so they do not send real notifications.

## 中文用法速览

```js
import { PushPal } from "pushpal";

const client = new PushPal({
  retry: 2,
  timeout: 5000,
});

await client.group(
  {
    telegram: { token: "BOT_TOKEN", chatId: "123456" },
    bark: { deviceKey: "YOUR_DEVICE_KEY" },
    ntfy: { topic: "ops-alerts" },
  },
  {
    title: "紧急通知",
    body: "生产数据库连接失败，请立即处理",
    url: "https://monitor.example.com",
  },
);
```

## License

MIT

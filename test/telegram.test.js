import { describe, expect, test, vi } from "vitest";
import { PushPal } from "../src/index.js";
import { createJsonResponse, readJsonRequest } from "./helpers.js";

describe("telegram channel", () => {
  test("posts an escaped HTML message with an inline URL button", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: true, result: { message_id: 1 } }));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.telegram(
      { token: "123456:secret-token", chatId: "chat-1" },
      {
        title: "CPU <hot>",
        body: "Usage > 90% & rising",
        url: "https://example.com/runbook",
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123456:secret-token/sendMessage",
      expect.objectContaining({ method: "POST" }),
    );
    expect(readJsonRequest(fetchMock)).toEqual({
      chat_id: "chat-1",
      text: "<b>CPU &lt;hot&gt;</b>\nUsage &gt; 90% &amp; rising",
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Open", url: "https://example.com/runbook" }]],
      },
    });
    expect(results).toEqual([
      {
        channel: "telegram",
        target: "telegram:chat:chat-1",
        ok: true,
        status: 200,
        data: { ok: true, result: { message_id: 1 } },
      },
    ]);
    expect(JSON.stringify(results)).not.toContain("secret-token");
  });

  test("uses custom Telegram button text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }));
    const client = new PushPal({ fetch: fetchMock });

    await client.telegram(
      { token: "123456:secret-token", chatId: "chat-1" },
      {
        title: "Runbook",
        body: "Open the incident guide",
        url: "https://example.com/runbook",
        buttonText: "View runbook",
      },
    );

    expect(readJsonRequest(fetchMock).reply_markup).toEqual({
      inline_keyboard: [[{ text: "View runbook", url: "https://example.com/runbook" }]],
    });
  });

  test("turns Telegram HTTP failures into SendResult failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: false, description: "Bad Request" }, { ok: false, status: 400 }));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.telegram(
      { token: "123456:secret-token", chatId: 123456 },
      { title: "Deploy", body: "Failed" },
    );

    expect(results).toEqual([
      {
        channel: "telegram",
        target: "telegram:chat:123456",
        ok: false,
        status: 400,
        data: { ok: false, description: "Bad Request" },
        error: "Bad Request",
      },
    ]);
  });

  test("throws TypeError when required Telegram fields are missing", async () => {
    const client = new PushPal({ fetch: vi.fn() });

    await expect(client.telegram({ token: "token" }, { title: "A", body: "B" })).rejects.toThrow(TypeError);
    await expect(client.telegram({ token: "token", chatId: "1" }, { title: "", body: "B" })).rejects.toThrow(TypeError);
  });
});

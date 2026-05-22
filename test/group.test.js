import { describe, expect, test, vi } from "vitest";
import { PushPal } from "../src/index.js";
import { createJsonResponse, createTextResponse, readJsonRequest } from "./helpers.js";

describe("group channel", () => {
  test("sends common fields to all configured channels and preserves failures", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ ok: true }))
      .mockRejectedValueOnce(new Error("bark offline"))
      .mockResolvedValueOnce(createTextResponse("ok"));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.group(
      {
        telegram: { token: "123456:secret-token", chatId: "chat-1" },
        bark: { deviceKey: "abcdef123456wxyz" },
        ntfy: { topic: "ops" },
      },
      {
        title: "Incident",
        body: "Database is down",
        url: "https://example.com/runbook",
        priority: 5,
        sound: "alarm",
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(readJsonRequest(fetchMock, 0).text).toBe("<b>Incident</b>\nDatabase is down");
    expect(readJsonRequest(fetchMock, 1)).not.toHaveProperty("sound");
    expect(fetchMock.mock.calls[2][1].headers).not.toHaveProperty("Priority");
    expect(fetchMock.mock.calls[2][1].headers.Click).toBe("https://example.com/runbook");
    expect(results).toEqual([
      expect.objectContaining({ channel: "telegram", ok: true }),
      {
        channel: "bark",
        target: "bark:key:abcd...wxyz",
        ok: false,
        error: "bark offline",
      },
      expect.objectContaining({ channel: "ntfy", ok: true }),
    ]);
  });

  test("returns an empty array for empty group and channel arrays", async () => {
    const client = new PushPal({ fetch: vi.fn() });

    await expect(client.group({}, { title: "A", body: "B" })).resolves.toEqual([]);
    await expect(client.telegram([], { title: "A", body: "B" })).resolves.toEqual([]);
    await expect(client.bark([], { title: "A", body: "B" })).resolves.toEqual([]);
    await expect(client.ntfy([], { title: "A", body: "B" })).resolves.toEqual([]);
  });
});

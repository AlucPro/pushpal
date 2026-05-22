import { describe, expect, test, vi } from "vitest";
import { PushPal } from "../src/index.js";
import { createJsonResponse, readJsonRequest } from "./helpers.js";

describe("bark channel", () => {
  test("posts a Bark v2 push payload and masks the device key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ code: 200, message: "success" }));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.bark(
      { serverUrl: "https://bark.example.com/", deviceKey: "abcdef123456wxyz" },
      {
        title: "Reminder",
        body: "Drink water",
        url: "https://example.com",
        level: "timeSensitive",
        sound: "minuet",
        isArchive: true,
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://bark.example.com/push",
      expect.objectContaining({ method: "POST" }),
    );
    expect(readJsonRequest(fetchMock)).toMatchObject({
      device_key: "abcdef123456wxyz",
      title: "Reminder",
      body: "Drink water",
      url: "https://example.com",
      level: "timeSensitive",
      sound: "minuet",
      isArchive: 1,
    });
    expect(results).toEqual([
      {
        channel: "bark",
        target: "bark:key:abcd...wxyz",
        ok: true,
        status: 200,
        data: { code: 200, message: "success" },
      },
    ]);
  });

  test("uses the public Bark server by default and reports fetch failures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.bark(
      { deviceKey: "abcdef123456wxyz" },
      { title: "Reminder", body: "Drink water" },
    );

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.day.app/push");
    expect(results).toEqual([
      {
        channel: "bark",
        target: "bark:key:abcd...wxyz",
        ok: false,
        error: "network down",
      },
    ]);
  });

  test("throws TypeError when deviceKey is missing", async () => {
    const client = new PushPal({ fetch: vi.fn() });

    await expect(client.bark({}, { title: "A", body: "B" })).rejects.toThrow(TypeError);
  });
});

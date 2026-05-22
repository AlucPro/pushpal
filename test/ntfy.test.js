import { describe, expect, test, vi } from "vitest";
import { PushPal } from "../src/index.js";
import { createTextResponse } from "./helpers.js";

describe("ntfy channel", () => {
  test("publishes body text with headers and bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createTextResponse("ok"));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.ntfy(
      {
        serverUrl: "https://ntfy.example.com/",
        topic: "ops alerts",
        auth: { type: "bearer", token: "tk_secret" },
      },
      {
        title: "Deploy",
        body: "v0.1 is live",
        url: "https://example.com/deploy",
        priority: 4,
        tags: ["rocket", "white_check_mark"],
        delay: "30min",
        sound: "ding",
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ntfy.example.com/ops%20alerts",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer tk_secret",
          Title: "Deploy",
          Click: "https://example.com/deploy",
          Priority: "4",
          Tags: "rocket,white_check_mark",
          Delay: "30min",
          Sound: "ding",
        },
        body: "v0.1 is live",
      },
    );
    expect(results).toEqual([
      {
        channel: "ntfy",
        target: "ntfy:topic:ops alerts",
        ok: true,
        status: 200,
        data: "ok",
      },
    ]);
    expect(JSON.stringify(results)).not.toContain("tk_secret");
  });

  test("supports basic auth and converts HTTP failures to SendResult", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createTextResponse("Unauthorized", { ok: false, status: 401 }));
    const client = new PushPal({ fetch: fetchMock });

    const results = await client.ntfy(
      {
        topic: "private",
        auth: { type: "basic", username: "alice", password: "secret" },
      },
      { title: "Alert", body: "Nope" },
    );

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Basic YWxpY2U6c2VjcmV0");
    expect(results).toEqual([
      {
        channel: "ntfy",
        target: "ntfy:topic:private",
        ok: false,
        status: 401,
        data: "Unauthorized",
        error: "Unauthorized",
      },
    ]);
  });

  test("throws TypeError when topic is missing", async () => {
    const client = new PushPal({ fetch: vi.fn() });

    await expect(client.ntfy({}, { title: "A", body: "B" })).rejects.toThrow(TypeError);
  });
});

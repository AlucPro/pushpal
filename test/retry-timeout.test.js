import { describe, expect, test, vi } from "vitest";
import { PushPal } from "../src/index.js";
import { createTextResponse } from "./helpers.js";

describe("retry and timeout options", () => {
  test("retries failed sends and returns the successful result", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary network failure"))
      .mockResolvedValueOnce(createTextResponse("ok"));
    const client = new PushPal({ fetch: fetchMock, retry: 1 });

    const results = await client.ntfy(
      { topic: "ops" },
      {
        title: "Deploy",
        body: "Retry me",
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      {
        channel: "ntfy",
        target: "ntfy:topic:ops",
        ok: true,
        status: 200,
        data: "ok",
      },
    ]);
  });

  test("allows message-level retry to override the client default", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("first"))
      .mockRejectedValueOnce(new Error("second"))
      .mockResolvedValueOnce(createTextResponse("ok"));
    const client = new PushPal({ fetch: fetchMock, retry: 0 });

    const results = await client.ntfy(
      { topic: "ops" },
      {
        title: "Deploy",
        body: "Retry me twice",
        retry: 2,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(results[0].ok).toBe(true);
  });

  test("passes an AbortSignal when timeout is configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createTextResponse("ok"));
    const client = new PushPal({ fetch: fetchMock, timeout: 1000 });

    await client.ntfy(
      { topic: "ops" },
      {
        title: "Deploy",
        body: "Use timeout",
      },
    );

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  test("reports timeout errors as SendResult failures", async () => {
    const fetchMock = vi.fn().mockImplementation((_url, init) => {
      init.signal.dispatchEvent(new Event("abort"));
      return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
    });
    const client = new PushPal({ fetch: fetchMock, timeout: 1 });

    const results = await client.ntfy(
      { topic: "ops" },
      {
        title: "Deploy",
        body: "Timeout",
      },
    );

    expect(results).toEqual([
      {
        channel: "ntfy",
        target: "ntfy:topic:ops",
        ok: false,
        error: "Request timed out after 1ms",
      },
    ]);
  });
});

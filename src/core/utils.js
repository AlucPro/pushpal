export function normalizeArray(config) {
  if (config === null || config === undefined) {
    throw new TypeError("[pushpal] config is required.");
  }
  return Array.isArray(config) ? config : [config];
}

export function assertFetch(fetcher) {
  if (typeof fetcher !== "function") {
    throw new TypeError("[pushpal] fetch is not available. Use Node.js >=18 or pass { fetch } to PushPal.");
  }
}

export function resolveSendOptions(defaults = {}, message = {}) {
  return {
    retry: normalizeNonNegativeInteger(message.retry ?? defaults.retry ?? 0, "retry"),
    timeout: normalizeOptionalPositiveInteger(message.timeout ?? defaults.timeout, "timeout"),
  };
}

export async function requestWithRetry(fetcher, url, init, options = {}) {
  const retry = options.retry ?? 0;
  let lastError;

  for (let attempt = 0; attempt <= retry; attempt += 1) {
    try {
      return await requestWithTimeout(fetcher, url, init, options.timeout);
    } catch (error) {
      lastError = error;
      if (attempt === retry) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function requestWithTimeout(fetcher, url, init, timeout) {
  if (timeout === undefined) {
    return fetcher(url, init);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetcher(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`[pushpal] ${name} must be a non-negative integer.`);
  }
  return value;
}

function normalizeOptionalPositiveInteger(value, name) {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`[pushpal] ${name} must be a positive integer in milliseconds.`);
  }
  return value;
}

export function validateCommonMessage(message) {
  if (!message || typeof message !== "object") {
    throw new TypeError("[pushpal] message is required.");
  }
  if (typeof message.title !== "string" || message.title.trim() === "") {
    throw new TypeError("[pushpal] message.title must be a non-empty string.");
  }
  if (typeof message.body !== "string") {
    throw new TypeError("[pushpal] message.body must be a string.");
  }
}

export function pickCommonMessage(message) {
  validateCommonMessage(message);
  const common = {
    title: message.title,
    body: message.body,
  };
  if (message.url !== undefined) {
    common.url = message.url;
  }
  return common;
}

export function trimTrailingSlash(url) {
  return String(url).replace(/\/+$/, "");
}

export function encodePathSegment(value) {
  return encodeURIComponent(String(value));
}

export async function parseResponseBody(response) {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return undefined;
    }
  }
}

export function errorFromResponseData(data, fallback = "Request failed") {
  if (typeof data === "string" && data) {
    return data;
  }
  if (data && typeof data === "object") {
    return data.description || data.message || data.error || fallback;
  }
  return fallback;
}

export function successResult(channel, target, response, data) {
  return {
    channel,
    target,
    ok: true,
    status: response.status,
    data,
  };
}

export function failureResult(channel, target, error, options = {}) {
  const result = {
    channel,
    target,
    ok: false,
  };
  if (options.status !== undefined) {
    result.status = options.status;
  }
  if (options.data !== undefined) {
    result.data = options.data;
  }
  result.error = error instanceof Error ? error.message : String(error);
  return result;
}

export function maskTarget(channel, config) {
  if (channel === "telegram") {
    return `telegram:chat:${String(config.chatId)}`;
  }
  if (channel === "bark") {
    return `bark:key:${maskSecret(config.deviceKey)}`;
  }
  if (channel === "ntfy") {
    return `ntfy:topic:${String(config.topic)}`;
  }
  return channel;
}

export function maskSecret(value) {
  const text = String(value);
  if (text.length <= 8) {
    return "****";
  }
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toBasicAuth(username, password) {
  const value = `${username}:${password}`;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }
  return btoa(value);
}

export function omitUndefined(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

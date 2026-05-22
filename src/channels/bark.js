import {
  assertFetch,
  errorFromResponseData,
  failureResult,
  maskTarget,
  omitUndefined,
  parseResponseBody,
  requestWithRetry,
  successResult,
  trimTrailingSlash,
  validateCommonMessage,
} from "../core/utils.js";

const DEFAULT_BARK_SERVER = "https://api.day.app";

export async function sendBark(config, message, fetcher, options = {}) {
  validateBarkConfig(config);
  validateCommonMessage(message);
  assertFetch(fetcher);

  const target = maskTarget("bark", config);
  const serverUrl = trimTrailingSlash(config.serverUrl || DEFAULT_BARK_SERVER);
  const body = createBarkPayload(config, message);

  try {
    const response = await requestWithRetry(fetcher, `${serverUrl}/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, options);
    const data = await parseResponseBody(response);
    if (!response.ok) {
      return failureResult("bark", target, errorFromResponseData(data), {
        status: response.status,
        data,
      });
    }
    return successResult("bark", target, response, data);
  } catch (error) {
    return failureResult("bark", target, error);
  }
}

export function validateBarkConfig(config) {
  if (!config || typeof config !== "object") {
    throw new TypeError("[pushpal] Bark config is required.");
  }
  if (typeof config.deviceKey !== "string" || config.deviceKey.trim() === "") {
    throw new TypeError("[pushpal] Bark deviceKey is required.");
  }
}

function createBarkPayload(config, message) {
  return omitUndefined({
    device_key: config.deviceKey,
    title: message.title,
    body: message.body,
    url: message.url,
    level: message.level,
    sound: message.sound,
    icon: message.icon,
    badge: message.badge,
    group: message.group,
    isArchive: message.isArchive === undefined ? undefined : message.isArchive ? 1 : 0,
    copy: message.copy,
  });
}

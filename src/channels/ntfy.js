import {
  assertFetch,
  encodePathSegment,
  errorFromResponseData,
  failureResult,
  maskTarget,
  omitUndefined,
  parseResponseBody,
  requestWithRetry,
  successResult,
  toBasicAuth,
  trimTrailingSlash,
  validateCommonMessage,
} from "../core/utils.js";

const DEFAULT_NTFY_SERVER = "https://ntfy.sh";

export async function sendNtfy(config, message, fetcher, options = {}) {
  validateNtfyConfig(config);
  validateCommonMessage(message);
  assertFetch(fetcher);

  const target = maskTarget("ntfy", config);
  const serverUrl = trimTrailingSlash(config.serverUrl || DEFAULT_NTFY_SERVER);
  const headers = createNtfyHeaders(config, message);

  try {
    const response = await requestWithRetry(fetcher, `${serverUrl}/${encodePathSegment(config.topic)}`, {
      method: "POST",
      headers,
      body: message.body,
    }, options);
    const data = await parseResponseBody(response);
    if (!response.ok) {
      return failureResult("ntfy", target, errorFromResponseData(data), {
        status: response.status,
        data,
      });
    }
    return successResult("ntfy", target, response, data);
  } catch (error) {
    return failureResult("ntfy", target, error);
  }
}

export function validateNtfyConfig(config) {
  if (!config || typeof config !== "object") {
    throw new TypeError("[pushpal] Ntfy config is required.");
  }
  if (typeof config.topic !== "string" || config.topic.trim() === "") {
    throw new TypeError("[pushpal] Ntfy topic is required.");
  }
  if (config.auth !== undefined) {
    validateNtfyAuth(config.auth);
  }
}

function validateNtfyAuth(auth) {
  if (!auth || typeof auth !== "object") {
    throw new TypeError("[pushpal] Ntfy auth must be an object.");
  }
  if (auth.type === "bearer" && typeof auth.token === "string" && auth.token) {
    return;
  }
  if (
    auth.type === "basic"
    && typeof auth.username === "string"
    && auth.username
    && typeof auth.password === "string"
  ) {
    return;
  }
  throw new TypeError("[pushpal] Ntfy auth must be bearer or basic credentials.");
}

function createNtfyHeaders(config, message) {
  const headers = omitUndefined({
    Title: message.title,
    Click: message.url,
    Priority: message.priority === undefined ? undefined : String(message.priority),
    Tags: Array.isArray(message.tags) ? message.tags.join(",") : undefined,
    Attach: message.attach,
    Icon: message.icon,
    Actions: Array.isArray(message.actions) ? serializeActions(message.actions) : undefined,
    Delay: message.delay === undefined ? undefined : String(message.delay),
    Email: message.email,
    Sound: message.sound,
  });

  if (config.auth?.type === "bearer") {
    headers.Authorization = `Bearer ${config.auth.token}`;
  }
  if (config.auth?.type === "basic") {
    headers.Authorization = `Basic ${toBasicAuth(config.auth.username, config.auth.password)}`;
  }

  return headers;
}

function serializeActions(actions) {
  return actions
    .map((action) => {
      const parts = [action.action, action.label];
      if (action.url) parts.push(action.url);
      if (action.method) parts.push(`method=${action.method}`);
      if (action.clear !== undefined) parts.push(`clear=${action.clear ? "true" : "false"}`);
      return parts.join(", ");
    })
    .join("; ");
}

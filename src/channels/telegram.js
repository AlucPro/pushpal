import {
  assertFetch,
  errorFromResponseData,
  escapeHtml,
  failureResult,
  maskTarget,
  omitUndefined,
  parseResponseBody,
  requestWithRetry,
  successResult,
  validateCommonMessage,
} from "../core/utils.js";

export async function sendTelegram(config, message, fetcher, options = {}) {
  validateTelegramConfig(config);
  validateCommonMessage(message);
  assertFetch(fetcher);

  const target = maskTarget("telegram", config);
  const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
  const body = createTelegramPayload(config, message);

  try {
    const response = await requestWithRetry(fetcher, url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, options);
    const data = await parseResponseBody(response);
    if (!response.ok) {
      return failureResult("telegram", target, errorFromResponseData(data), {
        status: response.status,
        data,
      });
    }
    return successResult("telegram", target, response, data);
  } catch (error) {
    return failureResult("telegram", target, error);
  }
}

export function validateTelegramConfig(config) {
  if (!config || typeof config !== "object") {
    throw new TypeError("[pushpal] Telegram config is required.");
  }
  if (typeof config.token !== "string" || config.token.trim() === "") {
    throw new TypeError("[pushpal] Telegram token is required.");
  }
  if (config.chatId === undefined || config.chatId === null || String(config.chatId).trim() === "") {
    throw new TypeError("[pushpal] Telegram chatId is required.");
  }
}

function createTelegramPayload(config, message) {
  const parseMode = message.parseMode || "HTML";
  const text = parseMode === "HTML"
    ? `<b>${escapeHtml(message.title)}</b>\n${escapeHtml(message.body)}`
    : `${message.title}\n${message.body}`;

  const payload = omitUndefined({
    chat_id: config.chatId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: message.disableWebPagePreview,
    disable_notification: message.disableNotification,
  });

  if (message.url) {
    payload.reply_markup = {
      inline_keyboard: [[{ text: message.buttonText || "Open", url: message.url }]],
    };
  }

  return payload;
}

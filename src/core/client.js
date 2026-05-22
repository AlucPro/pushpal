import { sendBark } from "../channels/bark.js";
import { sendNtfy } from "../channels/ntfy.js";
import { sendTelegram } from "../channels/telegram.js";
import { normalizeArray, pickCommonMessage, resolveSendOptions, validateCommonMessage } from "./utils.js";

export class PushPal {
  constructor(options = {}) {
    this.fetch = options.fetch || globalThis.fetch;
    this.options = {
      retry: options.retry,
      timeout: options.timeout,
    };
  }

  async telegram(config, message) {
    validateCommonMessage(message);
    const configs = normalizeArray(config);
    const sendOptions = resolveSendOptions(this.options, message);
    return Promise.all(configs.map((item) => sendTelegram(item, message, this.fetch, sendOptions)));
  }

  async bark(config, message) {
    validateCommonMessage(message);
    const configs = normalizeArray(config);
    const sendOptions = resolveSendOptions(this.options, message);
    return Promise.all(configs.map((item) => sendBark(item, message, this.fetch, sendOptions)));
  }

  async ntfy(config, message) {
    validateCommonMessage(message);
    const configs = normalizeArray(config);
    const sendOptions = resolveSendOptions(this.options, message);
    return Promise.all(configs.map((item) => sendNtfy(item, message, this.fetch, sendOptions)));
  }

  async group(groupConfig, message) {
    if (!groupConfig || typeof groupConfig !== "object") {
      throw new TypeError("[pushpal] group config is required.");
    }

    const commonMessage = pickCommonMessage(message);
    if (message.retry !== undefined) {
      commonMessage.retry = message.retry;
    }
    if (message.timeout !== undefined) {
      commonMessage.timeout = message.timeout;
    }
    const tasks = [];

    if (groupConfig.telegram !== undefined) {
      tasks.push(this.telegram(groupConfig.telegram, commonMessage));
    }
    if (groupConfig.bark !== undefined) {
      tasks.push(this.bark(groupConfig.bark, commonMessage));
    }
    if (groupConfig.ntfy !== undefined) {
      tasks.push(this.ntfy(groupConfig.ntfy, commonMessage));
    }

    const results = await Promise.all(tasks);
    return results.flat();
  }
}

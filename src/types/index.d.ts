export interface CommonMessage {
  title: string;
  body: string;
  url?: string;
  retry?: number;
  timeout?: number;
}

export interface TelegramMessage extends CommonMessage {
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  buttonText?: string;
}

export interface BarkMessage extends CommonMessage {
  level?: "critical" | "active" | "timeSensitive" | "passive";
  sound?: string;
  icon?: string;
  badge?: number;
  group?: string;
  isArchive?: boolean;
  copy?: string;
}

export interface NtfyAction {
  action: "view" | "broadcast" | "http";
  label: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  clear?: boolean;
}

export interface NtfyMessage extends CommonMessage {
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  attach?: string;
  icon?: string;
  actions?: NtfyAction[];
  delay?: string | number;
  email?: string;
  sound?: string;
}

export interface TelegramConfig {
  token: string;
  chatId: string | number;
}

export interface BarkConfig {
  serverUrl?: string;
  deviceKey: string;
}

export type NtfyAuth =
  | { type: "bearer"; token: string }
  | { type: "basic"; username: string; password: string };

export interface NtfyConfig {
  serverUrl?: string;
  topic: string;
  auth?: NtfyAuth;
}

export interface GroupConfig {
  telegram?: TelegramConfig | TelegramConfig[];
  bark?: BarkConfig | BarkConfig[];
  ntfy?: NtfyConfig | NtfyConfig[];
}

export interface SendResult {
  channel: "telegram" | "bark" | "ntfy";
  target: string;
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

export interface PushPalOptions {
  fetch?: typeof fetch;
  retry?: number;
  timeout?: number;
}

export declare class PushPal {
  constructor(options?: PushPalOptions);
  telegram(config: TelegramConfig | TelegramConfig[], message: TelegramMessage): Promise<SendResult[]>;
  bark(config: BarkConfig | BarkConfig[], message: BarkMessage): Promise<SendResult[]>;
  ntfy(config: NtfyConfig | NtfyConfig[], message: NtfyMessage): Promise<SendResult[]>;
  group(config: GroupConfig, message: CommonMessage): Promise<SendResult[]>;
}

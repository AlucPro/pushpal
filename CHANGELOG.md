# Changelog

## Unreleased

- Add GitHub Actions CI for Node.js 20, 22, and 24.
- Add npm Trusted Publishing release workflow triggered by published GitHub releases.
- Add `repository` metadata required for npm provenance matching.
- Add `verify` script for local release checks.
- Add npm/GitHub Actions/Trusted Publishing guide at `.ai-context/CONTENT/05_publish_guide.md`.

## 0.3.0

- Add optional `retry` and `timeout` controls at client and message level.
- Add custom Telegram URL button text with `buttonText`.

## 0.2.0

- Expand README with English and Chinese usage docs, examples, security guidance, and error handling notes.
- Add runnable offline examples for Telegram, Bark, Ntfy, Group, retry/timeout, ESM, and CJS.

## 0.1.0

- Add the initial PushPal SDK scaffold.
- Add Telegram, Bark, and Ntfy basic send support.
- Add `SendResult` success/failure results and target masking.
- Add TypeScript declarations.
- Add unit tests and Rollup build.

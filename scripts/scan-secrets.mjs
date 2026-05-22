import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((file) => !file.startsWith("node_modules/") && !file.startsWith("dist/"));

const patterns = [
  { name: "private key", regex: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/ },
  { name: "GitHub token", regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/ },
  { name: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/ },
  { name: "npm token", regex: /\bnpm_[A-Za-z0-9]{20,}\b/ },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "Telegram bot token", regex: /\b\d{8,12}:[A-Za-z0-9_-]{35,}\b/ },
  { name: "OpenAI API key", regex: /\bsk-[A-Za-z0-9_-]{32,}\b/ },
  { name: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "inline npm auth token", regex: /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*[^$\s][^\s]+/ },
];

const findings = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push(`${file}:${index + 1} ${pattern.name}`);
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Potential secrets found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("No high-confidence secrets found.");

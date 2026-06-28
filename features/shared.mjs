import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const host = process.env.HOST ?? "127.0.0.1";
export const port = Number(process.env.PORT ?? 3000);

export const imageSize = {
  width: 1600,
  height: 900,
};

export const streamTiming = {
  firstChunk: 500,
  step: 300,
};

export const html = (strings, ...values) =>
  String.raw({ raw: strings }, ...values).trim();

export const writeHTML = (res, status = 200) => {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Transfer-Encoding": "chunked",
  });
};

const escapeHTML = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const codeBlock = (source) => html`
  <pre class="code-block"><code>${escapeHTML(source.trim())}</code></pre>
`;

export const readTemplate = async (path) =>
  readFile(join(process.cwd(), path), "utf8");

export const renderTemplate = (template, values = {}) =>
  template.replaceAll(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => values[key] ?? "");

export const renderTemplateFile = async (path, values = {}) =>
  renderTemplate(await readTemplate(path), values);

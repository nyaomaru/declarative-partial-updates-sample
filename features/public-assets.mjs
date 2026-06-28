import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";

import { html, imageSize } from "./shared.mjs";

const publicDir = join(process.cwd(), "public");
const notFound = (res) => res.writeHead(404).end("Not found");

export const publicAsset = {
  isKit: {
    file: "iskit_image.png",
    alt: "is-kit sample asset",
    href: "https://github.com/nyaomaru/is-kit",
    label: "Open is-kit on GitHub",
  },
  divider: {
    file: "divider_image.png",
    alt: "Divider sample asset",
    href: "https://github.com/nyaomaru/divider",
    label: "Open divider on GitHub",
  },
  changelogBot: {
    file: "changelogbot_image.png",
    alt: "ChangelogBot sample asset",
    href: "https://github.com/nyaomaru/changelog-bot",
    label: "Open changelog-bot on GitHub",
  },
};

const contentTypes = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
]);

export const publicUrl = (file) => `/public/${file}`;

export const imageMarkup = (asset, className = "stream-image") => html`
  <img
    class="${className}"
    src="${publicUrl(asset.file)}"
    alt="${asset.alt}"
    width="${imageSize.width}"
    height="${imageSize.height}"
  />
`;

export const linkedImageMarkup = (asset, className = "media-frame") => html`
  <a class="${className}" href="${asset.href}" aria-label="${asset.label}">
    ${imageMarkup(asset)}
  </a>
`;

export const streamPublicFile = async (res, pathname) => {
  let requestedPath;

  try {
    requestedPath = decodeURIComponent(pathname.replace(/^\/public\//, ""));
  } catch {
    notFound(res);
    return;
  }

  const filePath = normalize(join(publicDir, requestedPath));
  const relativePath = relative(publicDir, filePath);

  try {
    if (relativePath.startsWith("..") || relativePath === "") {
      notFound(res);
      return;
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      notFound(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type":
        contentTypes.get(extname(filePath).toLowerCase()) ??
        "application/octet-stream",
      "Content-Length": fileStat.size,
      "Cache-Control": "no-store",
    });
    createReadStream(filePath).pipe(res);
  } catch {
    notFound(res);
  }
};

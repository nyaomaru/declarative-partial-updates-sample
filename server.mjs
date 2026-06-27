import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3000);
const publicDir = join(process.cwd(), "public");
const imageSize = {
  width: 1600,
  height: 900,
};

const streamDelay = {
  fast: 650,
  medium: 800,
  slow: 850,
  slower: 900,
};

const publicAsset = {
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

const publicUrl = (file) => `/public/${file}`;

const imageMarkup = (asset, className = "stream-image") => html`
  <img
    class="${className}"
    src="${publicUrl(asset.file)}"
    alt="${asset.alt}"
    width="${imageSize.width}"
    height="${imageSize.height}"
  />
`;

const linkedImageMarkup = (asset) => html`
  <a class="media-frame" href="${asset.href}" aria-label="${asset.label}">
    ${imageMarkup(asset)}
  </a>
`;

const escapeHTML = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const codeBlock = (source) => html`
  <pre class="code-block"><code>${escapeHTML(source.trim())}</code></pre>
`;

const html = (strings, ...values) =>
  String.raw({ raw: strings }, ...values).trim();

const writeHTML = (res, status = 200) => {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Transfer-Encoding": "chunked",
  });
};

const contentTypes = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"],
  [".css", "text/css; charset=utf-8"],
]);

const streamPublicFile = async (res, pathname) => {
  const requestedPath = decodeURIComponent(pathname.replace(/^\/public\//, ""));
  const filePath = normalize(join(publicDir, requestedPath));
  const relativePath = relative(publicDir, filePath);

  if (relativePath.startsWith("..") || relativePath === "") {
    res.writeHead(404).end("Not found");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      res.writeHead(404).end("Not found");
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
    res.writeHead(404).end("Not found");
  }
};

const layoutHead = (title) => html`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <link rel="stylesheet" href="/public/styles.css" />
    </head>
  </html>
`;

const pageStart = (title, current) => html`
  ${layoutHead(title)}
  <body>
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>DPU samples</span>
        </a>
        <nav aria-label="Samples">
          <a href="/" ${current === "home" ? 'aria-current="page"' : ""}>
            Document streaming
          </a>
          <a href="/spa" ${current === "spa" ? 'aria-current="page"' : ""}>
            SPA shell
          </a>
          <a href="/html-api" ${current === "api" ? 'aria-current="page"' : ""}>
            Static / Streaming APIs
          </a>
        </nav>
      </header>
    </div>
  </body>
`;

const pageEnd = html`
    </div>
  </body>
</html>
`;

const dpuInitialCode = html`
  <div class="media-frame hero-media">
    <?start name="hero-asset">
    <p class="loading">Streaming hero image...</p>
    <?end>
  </div>

  <section class="panel asset-panel">
    <h2>Streamed public assets</h2>
    <?start name="asset-strip">
    <p class="loading">Waiting for images from public/...</p>
    <?end>
  </section>
`;

const dpuStreamedCode = html`
  <template for="hero-asset">
    <img src="/public/iskit_image.png" alt="is-kit sample asset" />
  </template>

  <template for="asset-strip">
    <a href="https://github.com/nyaomaru/is-kit">
      <img src="/public/iskit_image.png" alt="is-kit sample asset" />
    </a>
    <a href="https://github.com/nyaomaru/divider">
      <img src="/public/divider_image.png" alt="Divider sample asset" />
    </a>
    <a href="https://github.com/nyaomaru/changelog-bot">
      <img
        src="/public/changelogbot_image.png"
        alt="ChangelogBot sample asset"
      />
    </a>
  </template>
`;

const streamHome = async (res) => {
  writeHTML(res);
  res.write(html`
    ${pageStart("DPU document streaming sample", "home")}
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Document streaming</p>
          <h1>Declarative Partial Updates</h1>
          <p class="lead">
            The initial document is visible immediately. Slow server-rendered
            fragments arrive later as <code>&lt;template for="..."&gt;</code>
            chunks and replace named DPU ranges without client-side DOM code.
          </p>
        </div>
        <div class="media-frame hero-media">
          <?start name="hero-asset">
          <p class="loading">Streaming hero image...</p>
          <?end>
        </div>
      </section>

      <section class="grid" aria-label="Streamed panels">
        <article class="panel">
          <h2>Recommendations</h2>
          <?start name="recommendations">
          <p class="loading">Waiting for recommendations...</p>
          <?end>
        </article>

        <article class="panel">
          <h2>Team activity</h2>
          <?start name="activity">
          <p class="loading">Waiting for activity...</p>
          <?end>
        </article>

        <article class="panel">
          <h2>Metric</h2>
          <?start name="metric">
          <p class="loading">Waiting for metric...</p>
          <?end>
        </article>
      </section>

      <section class="panel asset-panel">
        <h2>Streamed public assets</h2>
        <?start name="asset-strip">
        <p class="loading">Waiting for images from public/...</p>
        <?end>
      </section>

      <section class="panel asset-panel">
        <h2>Code visibility</h2>
        <p class="muted">
          Left is the initial DPU placeholder. Right is the streamed HTML that
          replaced the named regions.
        </p>
        <div class="code-grid">
          ${codeBlock(dpuInitialCode)} <?start name="streamed-code">
          ${codeBlock('<template for="..."> chunks are still streaming...')}
          <?end>
        </div>
      </section>
    </main>
  `);

  await sleep(streamDelay.medium);
  res.write(html`
    <template for="hero-asset">
      ${imageMarkup({
        ...publicAsset.isKit,
        alt: "is-kit visual streamed from public",
      })}
    </template>

    <template for="metric">
      <div class="metric">
        <strong>128 ms</strong>
        <span class="muted">Server fragment render time</span>
      </div>
    </template>
  `);

  await sleep(streamDelay.slower);
  res.write(html`
    <template for="asset-strip">
      <div class="asset-grid">
        ${linkedImageMarkup(publicAsset.isKit)}
        ${linkedImageMarkup(publicAsset.divider)}
        ${linkedImageMarkup(publicAsset.changelogBot)}
      </div>
    </template>

    <template for="streamed-code"> ${codeBlock(dpuStreamedCode)} </template>

    <template for="recommendations">
      <ul class="list">
        <li>Advanced CSS Layouts</li>
        <li>Modern HTML APIs</li>
        <li>Web Performance Basics</li>
      </ul>
    </template>
  `);

  await sleep(streamDelay.slower);
  res.end(html`
    <template for="activity">
      <ul class="list">
        <li>Profile fragment rendered on the server.</li>
        <li>Recommendations streamed out of order.</li>
        <li>No client-side selector update was written for this page.</li>
      </ul>
    </template>
    ${pageEnd}
  `);
};

const streamSpaShell = (res) => {
  writeHTML(res);
  res.end(html`
    ${pageStart("DPU SPA shell sample", "spa")}
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">SPA shell</p>
          <h1>SPA shell, streamed HTML route updates</h1>
          <p class="lead">
            Buttons keep local client state, while route content is streamed as
            HTML. When available, <code>streamHTMLUnsafe()</code> feeds the
            fetched response body directly into the existing view.
          </p>
        </div>
      </section>

      <section class="panel">
        <h2>Client-owned state</h2>
        <p>
          Counter: <strong id="counter">0</strong>
          <button id="increment" class="primary" type="button">
            Increment
          </button>
        </p>
      </section>

      <section class="toolbar" aria-label="SPA routes">
        <button class="primary" type="button" data-route="dashboard">
          Dashboard
        </button>
        <button type="button" data-route="reports">Reports</button>
        <button type="button" data-route="settings">Settings</button>
      </section>

      <section id="spa-view" aria-live="polite">
        <p class="loading">Waiting for streamed route content...</p>
      </section>
    </main>

    <script type="module">
      const counter = document.querySelector("#counter");
      const view = document.querySelector("#spa-view");

      document.querySelector("#increment").addEventListener("click", () => {
        counter.textContent = String(Number(counter.textContent) + 1);
      });

      const loadRoute = async (route) => {
        const response = await fetch(\`/partials/spa/\${route}\`);
        view.replaceChildren();

        if ("streamHTMLUnsafe" in Element.prototype && response.body) {
          await response.body
            .pipeThrough(new TextDecoderStream())
            .pipeTo(view.streamHTMLUnsafe());
          return;
        }

        const text = await response.text();
        const template = document.createElement("template");
        template.innerHTML = text;
        view.replaceChildren(template.content.cloneNode(true));
      };

      document.querySelectorAll("[data-route]").forEach((button) => {
        button.addEventListener("click", () => {
          document
            .querySelectorAll("[data-route]")
            .forEach((item) =>
              item.classList.toggle("primary", item === button),
            );
          loadRoute(button.dataset.route);
        });
      });

      loadRoute("dashboard");
    </script>
    ${pageEnd}
  `);
};

const spaData = {
  dashboard: {
    title: "Dashboard",
    first: "Revenue, deploy health, and support load are server-rendered HTML.",
    second: "The counter above stays client-owned across streamed updates.",
    asset: {
      ...publicAsset.isKit,
      alt: "is-kit streamed route asset",
    },
  },
  reports: {
    title: "Reports",
    first: "Quarterly report cards can arrive as partial HTML.",
    second: "This route intentionally waits between title and body chunks.",
    asset: {
      ...publicAsset.divider,
      alt: "Divider streamed route asset",
    },
  },
  settings: {
    title: "Settings",
    first: "Account preferences are shown as trusted server-generated markup.",
    second: "Interactive controls would still belong to client JavaScript.",
    asset: {
      ...publicAsset.changelogBot,
      alt: "ChangelogBot streamed route asset",
    },
  },
};

const streamSpaPartial = async (res, route) => {
  const data = spaData[route] ?? spaData.dashboard;
  writeHTML(res);

  res.write(html`
    <h2>${data.title}</h2>
    <section class="grid">
      <article class="panel">
        <h3>Server HTML</h3>
        <p>${data.first}</p>
      </article>
      <article class="panel">
        <h3>Hybrid responsibility</h3>
        <p>${data.second}</p>
      </article>
      <article class="panel">
        <h3>Route</h3>
        <p><code>${route}</code> was fetched as HTML, not JSON.</p>
      </article>
    </section>
  `);

  await sleep(streamDelay.fast);
  res.end(html`
    <div class="media-frame">${imageMarkup(data.asset)}</div>
    <p class="muted">A delayed image chunk arrived after the route body.</p>
  `);
};

const streamHtmlApiPage = (res) => {
  writeHTML(res);
  res.end(html`
    ${pageStart("Static and Streaming HTML API sample", "api")}
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">HTML insertion</p>
          <h1>Static and Streaming HTML APIs</h1>
          <p class="lead">
            This page tries the new insertion names directly:
            <code>setHTMLUnsafe()</code> for static HTML and
            <code>streamHTMLUnsafe()</code> for streamed HTML. It falls back to
            older APIs so the demo still shows what would be inserted.
          </p>
        </div>
      </section>

      <section class="grid">
        <article class="panel">
          <h2>Static insertion</h2>
          <div id="static-target">
            <p class="loading">Click static insert.</p>
          </div>
          <button id="static-button" class="primary" type="button">
            Static insert
          </button>
        </article>

        <article class="panel">
          <h2>Streaming insertion</h2>
          <div id="stream-target">
            <p class="loading">Click stream HTML.</p>
          </div>
          <button id="stream-button" class="primary" type="button">
            Stream HTML
          </button>
        </article>

        <article class="panel">
          <h2>API support</h2>
          <div id="support"></div>
        </article>
      </section>
    </main>

    <script type="module">
      const staticTarget = document.querySelector("#static-target");
      const streamTarget = document.querySelector("#stream-target");
      const support = document.querySelector("#support");

      support.innerHTML = \`
          <ul class="list">
            <li>setHTMLUnsafe: \${"setHTMLUnsafe" in Element.prototype}</li>
            <li>streamHTMLUnsafe: \${"streamHTMLUnsafe" in Element.prototype}</li>
          </ul>
        \`;

      document.querySelector("#static-button").addEventListener("click", () => {
        const markup = \`
            <ul class="list">
              <li>Inserted with the new static HTML API when available.</li>
              <li>Fallback path uses replaceChildren() plus a template.</li>
            </ul>
            <div class="media-frame inset-media">
              <img
                class="stream-image"
                src="${publicUrl(publicAsset.isKit.file)}"
                alt="is-kit static insertion asset"
                width="${imageSize.width}"
                height="${imageSize.height}"
              />
            </div>
          \`;

        if ("setHTMLUnsafe" in Element.prototype) {
          staticTarget.setHTMLUnsafe(markup);
          return;
        }

        const template = document.createElement("template");
        template.innerHTML = markup;
        staticTarget.replaceChildren(template.content.cloneNode(true));
      });

      document
        .querySelector("#stream-button")
        .addEventListener("click", async () => {
          const response = await fetch("/partials/html-api-stream");

          streamTarget.replaceChildren();

          if ("streamHTMLUnsafe" in Element.prototype && response.body) {
            await response.body
              .pipeThrough(new TextDecoderStream())
              .pipeTo(streamTarget.streamHTMLUnsafe());
            return;
          }

          const template = document.createElement("template");
          template.innerHTML = await response.text();
          streamTarget.replaceChildren(template.content.cloneNode(true));
        });
    </script>
    ${pageEnd}
  `);
};

const streamHtmlApiPartial = async (res) => {
  writeHTML(res);
  res.write(html`
    <div class="chunk-stack">
      <div class="panel">
        <h3>Chunk 1</h3>
        <p>The first HTML chunk rendered before the full response completed.</p>
      </div>
    </div>
  `);

  await sleep(streamDelay.slow);
  res.write(html`
    <div class="media-frame">
      ${imageMarkup({
        ...publicAsset.divider,
        alt: "Divider image streamed from public",
      })}
    </div>
    <div class="panel">
      <h3>Chunk 2</h3>
      <p>Streaming keeps appending trusted server-generated HTML and assets.</p>
    </div>
  `);

  await sleep(streamDelay.slow);
  res.end(html`
    <div class="panel">
      <h3>Chunk 3</h3>
      <p>The response ended after this final fragment.</p>
    </div>
    </div>
  `);
};

const notFound = (res) => {
  writeHTML(res, 404);
  res.end(html`
    ${pageStart("Not found", "")}
    <main class="panel">
      <h1>Not found</h1>
      <p class="lead">No sample exists for this URL.</p>
    </main>
    ${pageEnd}
  `);
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname.startsWith("/public/")) {
    streamPublicFile(res, url.pathname);
    return;
  }

  if (url.pathname === "/") {
    streamHome(res).catch((error) => {
      console.error(error);
      res.destroy(error);
    });
    return;
  }

  if (url.pathname === "/spa") {
    streamSpaShell(res);
    return;
  }

  if (url.pathname.startsWith("/partials/spa/")) {
    const route = url.pathname.split("/").at(-1);
    streamSpaPartial(res, route).catch((error) => {
      console.error(error);
      res.destroy(error);
    });
    return;
  }

  if (url.pathname === "/html-api") {
    streamHtmlApiPage(res);
    return;
  }

  if (url.pathname === "/partials/html-api-stream") {
    streamHtmlApiPartial(res).catch((error) => {
      console.error(error);
      res.destroy(error);
    });
    return;
  }

  notFound(res);
}).listen(port, host, () => {
  console.log(`DPU samples: http://${host}:${port}`);
});

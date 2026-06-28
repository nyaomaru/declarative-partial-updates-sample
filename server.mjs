import { createServer } from "node:http";

import {
  streamSetApisPage,
  streamSetApisStaticPartial,
  streamSetApisStreamPartial,
} from "./features/set-apis/index.mjs";
import { streamHome } from "./features/home/index.mjs";
import { notFound } from "./features/not-found.mjs";
import { streamPublicFile } from "./features/public-assets.mjs";
import { host, port } from "./features/shared.mjs";
import { streamSpaPartial, streamSpaShell } from "./features/spa/index.mjs";

const handleAsync = (res, task) => {
  task().catch((error) => {
    console.error(error);
    res.destroy(error);
  });
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname.startsWith("/public/")) {
    handleAsync(res, () => streamPublicFile(res, url.pathname));
    return;
  }

  if (url.pathname === "/") {
    handleAsync(res, () => streamHome(res));
    return;
  }

  if (url.pathname === "/spa" || url.pathname.startsWith("/spa/")) {
    handleAsync(res, () => streamSpaShell(res));
    return;
  }

  if (url.pathname.startsWith("/partials/spa/")) {
    const route = url.pathname.split("/").at(-1);
    handleAsync(res, () => streamSpaPartial(res, route));
    return;
  }

  if (url.pathname === "/set-apis") {
    handleAsync(res, () => streamSetApisPage(res));
    return;
  }

  if (url.pathname === "/partials/set-apis/static") {
    handleAsync(res, () => streamSetApisStaticPartial(res));
    return;
  }

  if (url.pathname === "/partials/set-apis/stream") {
    handleAsync(res, () => streamSetApisStreamPartial(res));
    return;
  }

  handleAsync(res, () => notFound(res));
}).listen(port, host, () => {
  console.log(`DPU samples: http://${host}:${port}`);
});

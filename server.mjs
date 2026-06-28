import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import {
  streamSetApisPage,
  streamSetApisStaticPartial,
  streamSetApisStreamPartial,
} from "./features/set-apis/index.mjs";
import { streamHome } from "./features/home/index.mjs";
import { notFound } from "./features/not-found.mjs";
import { streamPublicFile } from "./features/public-assets.mjs";
import { host, port } from "./features/shared.mjs";
import {
  streamHybridShell,
  streamHybridShellPartial,
} from "./features/hybrid-shell/index.mjs";

const handleAsync = (res, task) => {
  task().catch((error) => {
    console.error(error);
    res.destroy(error);
  });
};

const staticRoutes = new Map([
  ["/", streamHome],
  ["/set-apis", streamSetApisPage],
]);

const partialRoutes = new Map([
  ["/partials/set-apis/static", streamSetApisStaticPartial],
  ["/partials/set-apis/stream", streamSetApisStreamPartial],
]);

const routeFromPathname = (pathname) => pathname.split("/").at(-1);

export const handleRequest = (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname.startsWith("/public/")) {
    handleAsync(res, () => streamPublicFile(res, url.pathname));
    return;
  }

  const staticRoute = staticRoutes.get(url.pathname);
  if (staticRoute) {
    handleAsync(res, () => staticRoute(res));
    return;
  }

  if (
    url.pathname === "/hybrid-shell" ||
    url.pathname.startsWith("/hybrid-shell/")
  ) {
    handleAsync(res, () => streamHybridShell(res));
    return;
  }

  if (url.pathname.startsWith("/partials/hybrid-shell/")) {
    const route = routeFromPathname(url.pathname);
    handleAsync(res, () => streamHybridShellPartial(res, route));
    return;
  }

  const partialRoute = partialRoutes.get(url.pathname);
  if (partialRoute) {
    handleAsync(res, () => partialRoute(res));
    return;
  }

  handleAsync(res, () => notFound(res));
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer(handleRequest).listen(port, host, () => {
    console.log(`DPU samples: http://${host}:${port}`);
  });
}

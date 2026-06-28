import { setTimeout as sleep } from "node:timers/promises";

import { pageEnd, pageStart } from "../layout.mjs";
import { imageMarkup, publicAsset } from "../public-assets.mjs";
import { renderTemplateFile, streamTiming, writeHTML } from "../shared.mjs";

const templatePath = {
  page: "features/hybrid-shell/page.html",
  routeBody: "features/hybrid-shell/route-body.html",
  routeImage: "features/hybrid-shell/route-image.html",
};

export const streamHybridShell = async (res) => {
  writeHTML(res);
  res.end(
    await renderTemplateFile(templatePath.page, {
      pageStart: await pageStart(
        "DPU hybrid shell streaming sample",
        "hybrid-shell",
      ),
      pageEnd: await pageEnd(),
    }),
  );
};

const routeData = {
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

export const streamHybridShellPartial = async (res, route) => {
  const data = routeData[route] ?? routeData.dashboard;
  writeHTML(res);

  res.write(
    await renderTemplateFile(templatePath.routeBody, {
      title: data.title,
      first: data.first,
      second: data.second,
      route,
    }),
  );

  await sleep(streamTiming.firstChunk);
  res.end(
    await renderTemplateFile(templatePath.routeImage, {
      routeImage: imageMarkup(data.asset),
    }),
  );
};

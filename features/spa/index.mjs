import { setTimeout as sleep } from "node:timers/promises";

import { pageEnd, pageStart } from "../layout.mjs";
import { imageMarkup, publicAsset } from "../public-assets.mjs";
import { renderTemplateFile, streamTiming, writeHTML } from "../shared.mjs";

export const streamSpaShell = async (res) => {
  writeHTML(res);
  res.end(
    await renderTemplateFile("features/spa/page.html", {
      pageStart: await pageStart("DPU SPA shell sample", "spa"),
      pageEnd: await pageEnd(),
    }),
  );
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

export const streamSpaPartial = async (res, route) => {
  const data = spaData[route] ?? spaData.dashboard;
  writeHTML(res);

  res.write(
    await renderTemplateFile("features/spa/route-body.html", {
      title: data.title,
      first: data.first,
      second: data.second,
      route,
    }),
  );

  await sleep(streamTiming.firstChunk);
  res.end(
    await renderTemplateFile("features/spa/route-image.html", {
      routeImage: imageMarkup(data.asset),
    }),
  );
};

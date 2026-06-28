import { setTimeout as sleep } from "node:timers/promises";

import { pageEnd, pageStart } from "../layout.mjs";
import { linkedImageMarkup, publicAsset } from "../public-assets.mjs";
import {
  codeBlock,
  renderTemplateFile,
  streamTiming,
  writeHTML,
} from "../shared.mjs";

const templatePath = {
  page: "features/home/page.html",
  dpuInitialCode: "features/home/dpu-initial-code.html",
  dpuStreamedCode: "features/home/dpu-streamed-code.html",
  heroAndMetric: "features/home/chunk-hero-and-metric.html",
  assetLink: "features/home/chunk-asset-link.html",
  assetsAndRecommendations:
    "features/home/chunk-assets-and-recommendations.html",
  activity: "features/home/chunk-activity.html",
};

export const streamHome = async (res) => {
  const startedAt = performance.now();
  writeHTML(res);
  res.write(
    await renderTemplateFile(templatePath.page, {
      pageStart: await pageStart("DPU document streaming sample", "home"),
      dpuInitialCodeBlock: codeBlock(
        await renderTemplateFile(templatePath.dpuInitialCode),
      ),
      streamingPlaceholderCodeBlock: codeBlock(
        '<template for="..."> chunks are still streaming...',
      ),
    }),
  );

  await sleep(streamTiming.firstChunk);
  res.write(
    await renderTemplateFile(templatePath.heroAndMetric, {
      heroImage: linkedImageMarkup(
        {
          ...publicAsset.isKit,
          alt: "is-kit visual streamed from public",
        },
        "media-link",
      ),
      metricMs: Math.round(performance.now() - startedAt),
    }),
  );

  await sleep(streamTiming.step);
  res.write(
    await renderTemplateFile(templatePath.assetLink, {
      assetLink: linkedImageMarkup(publicAsset.isKit),
    }),
  );

  await sleep(streamTiming.assetPhase);
  res.write(
    await renderTemplateFile(templatePath.assetLink, {
      assetLink: linkedImageMarkup(publicAsset.divider),
    }),
  );

  await sleep(streamTiming.assetPhase);
  res.write(
    await renderTemplateFile(templatePath.assetLink, {
      assetLink: linkedImageMarkup(publicAsset.changelogBot),
    }),
  );

  await sleep(streamTiming.assetPhase);
  res.write(
    await renderTemplateFile(templatePath.assetsAndRecommendations, {
      dpuStreamedCodeBlock: codeBlock(
        await renderTemplateFile(templatePath.dpuStreamedCode),
      ),
    }),
  );

  await sleep(streamTiming.step);
  res.end(
    `${await renderTemplateFile(templatePath.activity)}
    ${await pageEnd()}`,
  );
};

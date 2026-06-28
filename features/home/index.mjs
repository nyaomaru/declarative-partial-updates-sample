import { setTimeout as sleep } from "node:timers/promises";

import { pageEnd, pageStart } from "../layout.mjs";
import {
  imageMarkup,
  linkedImageMarkup,
  publicAsset,
} from "../public-assets.mjs";
import {
  codeBlock,
  renderTemplateFile,
  streamTiming,
  writeHTML,
} from "../shared.mjs";

export const streamHome = async (res) => {
  const startedAt = performance.now();
  writeHTML(res);
  res.write(
    await renderTemplateFile("features/home/page.html", {
      pageStart: await pageStart("DPU document streaming sample", "home"),
      dpuInitialCodeBlock: codeBlock(
        await renderTemplateFile("features/home/dpu-initial-code.html"),
      ),
      streamingPlaceholderCodeBlock: codeBlock(
        '<template for="..."> chunks are still streaming...',
      ),
    }),
  );

  await sleep(streamTiming.firstChunk);
  res.write(
    await renderTemplateFile("features/home/chunk-hero-and-metric.html", {
      heroImage: imageMarkup({
        ...publicAsset.isKit,
        alt: "is-kit visual streamed from public",
      }),
      metricMs: Math.round(performance.now() - startedAt),
    }),
  );

  await sleep(streamTiming.step);
  res.write(
    await renderTemplateFile("features/home/chunk-asset-link.html", {
      assetLink: linkedImageMarkup(publicAsset.isKit),
    }),
  );

  await sleep(streamTiming.assetPhase);
  res.write(
    await renderTemplateFile("features/home/chunk-asset-link.html", {
      assetLink: linkedImageMarkup(publicAsset.divider),
    }),
  );

  await sleep(streamTiming.assetPhase);
  res.write(
    await renderTemplateFile("features/home/chunk-asset-link.html", {
      assetLink: linkedImageMarkup(publicAsset.changelogBot),
    }),
  );

  await sleep(streamTiming.assetPhase);
  res.write(
    await renderTemplateFile("features/home/chunk-assets-and-recommendations.html", {
      dpuStreamedCodeBlock: codeBlock(
        await renderTemplateFile("features/home/dpu-streamed-code.html"),
      ),
    }),
  );

  await sleep(streamTiming.step);
  res.end(
    `${await renderTemplateFile("features/home/chunk-activity.html")}
    ${await pageEnd()}`,
  );
};

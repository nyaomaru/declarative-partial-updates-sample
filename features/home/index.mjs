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
    }),
  );

  await sleep(streamTiming.step);
  res.write(
    await renderTemplateFile(
      "features/home/chunk-assets-and-recommendations.html",
      {
        isKitLink: linkedImageMarkup(publicAsset.isKit),
        dividerLink: linkedImageMarkup(publicAsset.divider),
        changelogBotLink: linkedImageMarkup(publicAsset.changelogBot),
        dpuStreamedCodeBlock: codeBlock(
          await renderTemplateFile("features/home/dpu-streamed-code.html"),
        ),
      },
    ),
  );

  await sleep(streamTiming.step);
  res.end(
    `${await renderTemplateFile("features/home/chunk-activity.html")}
    ${await pageEnd()}`,
  );
};

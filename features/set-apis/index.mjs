import { setTimeout as sleep } from "node:timers/promises";

import { pageEnd, pageStart } from "../layout.mjs";
import { linkedImageMarkup, publicAsset } from "../public-assets.mjs";
import { renderTemplateFile, streamTiming, writeHTML } from "../shared.mjs";

const templatePath = {
  page: "features/set-apis/page.html",
  staticInsertion: "features/set-apis/static-insertion.html",
  streamStart: "features/set-apis/stream-start.html",
  streamMiddle: "features/set-apis/stream-middle.html",
  streamEnd: "features/set-apis/stream-end.html",
};

export const streamSetApisPage = async (res) => {
  writeHTML(res);
  res.end(
    await renderTemplateFile(templatePath.page, {
      pageStart: await pageStart(
        "Set APIs and streaming HTML sample",
        "set-apis",
      ),
      pageEnd: await pageEnd(),
    }),
  );
};

export const streamSetApisStaticPartial = async (res) => {
  writeHTML(res);
  res.end(
    await renderTemplateFile(templatePath.staticInsertion, {
      staticImage: linkedImageMarkup(
        {
          ...publicAsset.isKit,
          alt: "is-kit static insertion asset",
        },
        "media-frame inset-media",
      ),
    }),
  );
};

export const streamSetApisStreamPartial = async (res) => {
  writeHTML(res);
  res.write(await renderTemplateFile(templatePath.streamStart));

  await sleep(streamTiming.firstChunk);
  res.write(
    await renderTemplateFile(templatePath.streamMiddle, {
      streamImage: linkedImageMarkup({
        ...publicAsset.divider,
        alt: "Divider image streamed from public",
      }),
    }),
  );

  await sleep(streamTiming.step);
  res.end(await renderTemplateFile(templatePath.streamEnd));
};

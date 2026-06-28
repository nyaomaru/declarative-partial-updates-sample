import { setTimeout as sleep } from "node:timers/promises";

import { pageEnd, pageStart } from "../layout.mjs";
import { imageMarkup, publicAsset } from "../public-assets.mjs";
import { renderTemplateFile, streamTiming, writeHTML } from "../shared.mjs";

export const streamSetApisPage = async (res) => {
  writeHTML(res);
  res.end(
    await renderTemplateFile("features/set-apis/page.html", {
      pageStart: await pageStart("Set APIs and streaming HTML sample", "set-apis"),
      pageEnd: await pageEnd(),
    }),
  );
};

export const streamSetApisStaticPartial = async (res) => {
  writeHTML(res);
  res.end(
    await renderTemplateFile("features/set-apis/static-insertion.html", {
      staticImage: imageMarkup({
        ...publicAsset.isKit,
        alt: "is-kit static insertion asset",
      }),
    }),
  );
};

export const streamSetApisStreamPartial = async (res) => {
  writeHTML(res);
  res.write(await renderTemplateFile("features/set-apis/stream-start.html"));

  await sleep(streamTiming.firstChunk);
  res.write(
    await renderTemplateFile("features/set-apis/stream-middle.html", {
      streamImage: imageMarkup({
        ...publicAsset.divider,
        alt: "Divider image streamed from public",
      }),
    }),
  );

  await sleep(streamTiming.step);
  res.end(await renderTemplateFile("features/set-apis/stream-end.html"));
};

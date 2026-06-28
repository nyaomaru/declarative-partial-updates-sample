import {
  setHTML,
  streamHTML,
  supportsStaticHTMLInsertion,
  supportsStreamingHTMLInsertion,
} from "/public/html-stream.js";

const staticTarget = document.querySelector("#static-target");
const streamTarget = document.querySelector("#stream-target");
const support = document.querySelector("#support");

support.innerHTML = `
  <ul class="list">
    <li>setHTMLUnsafe: ${supportsStaticHTMLInsertion()}</li>
    <li>streamHTMLUnsafe: ${supportsStreamingHTMLInsertion()}</li>
  </ul>
`;

document.querySelector("#static-button").addEventListener("click", async () => {
  const markup = await fetch("/partials/set-apis/static").then((response) =>
    response.text(),
  );

  setHTML(staticTarget, markup);
});

document.querySelector("#stream-button").addEventListener("click", async () => {
  await streamHTML(streamTarget, await fetch("/partials/set-apis/stream"));
});

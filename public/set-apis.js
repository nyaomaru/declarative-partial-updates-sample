const staticTarget = document.querySelector("#static-target");
const streamTarget = document.querySelector("#stream-target");
const support = document.querySelector("#support");

support.innerHTML = `
  <ul class="list">
    <li>setHTMLUnsafe: ${"setHTMLUnsafe" in Element.prototype}</li>
    <li>streamHTMLUnsafe: ${"streamHTMLUnsafe" in Element.prototype}</li>
  </ul>
`;

document.querySelector("#static-button").addEventListener("click", async () => {
  const markup = await fetch("/partials/set-apis/static").then((response) =>
    response.text(),
  );

  if ("setHTMLUnsafe" in Element.prototype) {
    staticTarget.setHTMLUnsafe(markup);
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = markup;
  staticTarget.replaceChildren(template.content.cloneNode(true));
});

document.querySelector("#stream-button").addEventListener("click", async () => {
  const response = await fetch("/partials/set-apis/stream");

  streamTarget.replaceChildren();

  if ("streamHTMLUnsafe" in Element.prototype && response.body) {
    await response.body
      .pipeThrough(new TextDecoderStream())
      .pipeTo(streamTarget.streamHTMLUnsafe());
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = await response.text();
  streamTarget.replaceChildren(template.content.cloneNode(true));
});

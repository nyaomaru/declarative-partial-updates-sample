export const supportsStaticHTMLInsertion = () =>
  "setHTMLUnsafe" in Element.prototype;

export const supportsStreamingHTMLInsertion = () =>
  "streamHTMLUnsafe" in Element.prototype;

export const replaceWithHTML = (target, markup) => {
  const template = document.createElement("template");
  template.innerHTML = markup;
  target.replaceChildren(template.content.cloneNode(true));
};

export const setHTML = (target, markup) => {
  if (supportsStaticHTMLInsertion()) {
    target.setHTMLUnsafe(markup);
    return;
  }

  replaceWithHTML(target, markup);
};

export const streamHTML = async (target, response) => {
  target.replaceChildren();

  if (supportsStreamingHTMLInsertion() && response.body) {
    await response.body
      .pipeThrough(new TextDecoderStream())
      .pipeTo(target.streamHTMLUnsafe());
    return;
  }

  replaceWithHTML(target, await response.text());
};

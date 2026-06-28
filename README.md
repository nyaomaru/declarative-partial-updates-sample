# Declarative Partial Updates sample

A small Node.js sample app for trying Chrome's experimental Declarative Partial
Updates (DPU) feature.

The UI is styled to match the dark/green theme used in `../is-kit/docs`. Images
under `public/` are served through the Node.js stream handler at `/public/...`,
then inserted from later DPU or HTML streaming chunks.

Styles live in `public/styles.css`. `server.mjs` keeps stream delays, image
dimensions, public assets, and GitHub links in constants so the sample behavior
is easier to inspect and adjust.

The server is split by feature:

- `features/home/`: DPU document streaming sample HTML and stream chunks
- `features/spa/`: SPA shell HTML and route partial HTML
- `features/set-apis/`: static and streaming HTML insertion sample HTML
- `features/public-assets.mjs`: public asset metadata and stream handler
- `features/layout/`: shared document layout HTML
- `features/layout.mjs`: layout template renderer
- `features/shared.mjs`: common helpers and demo timing constants

## Run

```bash
npm start
```

Open:

- <http://localhost:3000/>: DPU document streaming sample
- <http://localhost:3000/spa>: SPA routes with streamed HTML partials
- <http://localhost:3000/set-apis>: Set APIs and streaming HTML sample

## Chrome Flags

DPU and the new HTML insertion / streaming APIs are experimental. Use Chrome
Canary, or a Chrome build that includes the feature, with experimental web
platform features enabled.

```bash
google-chrome \
  --enable-experimental-web-platform-features \
  --user-data-dir=/tmp/dpu-chrome-profile \
  http://localhost:3000/
```

Depending on your environment, the executable may be named `google-chrome`,
`google-chrome-unstable`, `chromium`, or `chromium-browser`.

## Samples

### `/`

The initial document response includes DPU replacement regions.

```html
<?start name="recommendations">
  <p>Waiting...</p>
<?end>
```

The server later streams an out-of-order HTML chunk.

```html
<template for="recommendations">
  <ul>...</ul>
</template>
```

In a supporting browser, the placeholder is replaced without client-side
JavaScript. The hero image and public asset strip are also replaced by later
`<template for="...">` chunks.

The `Code visibility` section shows the initial placeholder markup next to the
streamed template markup that replaced it.

### `/spa`

Client-owned state, such as the counter, stays in JavaScript. Route navigation
uses the History API, so `/spa/dashboard`, `/spa/reports`, and `/spa/settings`
can be entered directly or reached without a full page reload. Route content is
returned by the server as trusted HTML partials. In supporting browsers,
`streamHTMLUnsafe()` streams the response body directly into the DOM.

The route body also receives a later chunk that inserts an image from `public/`.

In the Chromium build used during verification, piping `<template for="...">`
into `streamHTMLUnsafe()` inside the SPA left the template in the DOM instead of
updating a DPU range. Because of that, this sample demonstrates the new
streaming HTML insertion API for SPA-style updates rather than DPU range
replacement inside the SPA.

### `/set-apis`

This page exercises the new static and streaming HTML insertion APIs mentioned
in the Chrome article.

- `setHTMLUnsafe(markup)`
- `streamHTMLUnsafe()`

Fallbacks are included so the page still shows the inserted markup in browsers
without the new APIs, but the real streaming / DPU behavior requires a browser
with the experimental features enabled.

The streaming insertion sample includes an image fragment that references
`public/divider_image.png` in the middle of the HTML stream.

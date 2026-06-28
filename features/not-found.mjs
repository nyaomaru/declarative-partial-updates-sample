import { pageEnd, pageStart } from "./layout.mjs";
import { html, writeHTML } from "./shared.mjs";

export const notFound = async (res) => {
  writeHTML(res, 404);
  res.end(html`
    ${await pageStart("Not found", "")}
    <main class="panel">
      <h1>Not found</h1>
      <p class="lead">No sample exists for this URL.</p>
    </main>
    ${await pageEnd()}
  `);
};

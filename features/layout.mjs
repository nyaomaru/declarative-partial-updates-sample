import { renderTemplateFile } from "./shared.mjs";

export const pageStart = (title, current) =>
  renderTemplateFile("features/layout/page-start.html", {
    title,
    homeCurrent: current === "home" ? 'aria-current="page"' : "",
    spaCurrent: current === "spa" ? 'aria-current="page"' : "",
    setApisCurrent: current === "set-apis" ? 'aria-current="page"' : "",
  });

export const pageEnd = () => renderTemplateFile("features/layout/page-end.html");

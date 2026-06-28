const counter = document.querySelector("#counter");
const view = document.querySelector("#spa-view");
const routeButtons = [...document.querySelectorAll("[data-route]")];
const routes = new Set(routeButtons.map((button) => button.dataset.route));

document.querySelector("#increment").addEventListener("click", () => {
  counter.textContent = String(Number(counter.textContent) + 1);
});

const routeFromLocation = () => {
  const route = window.location.pathname.split("/").filter(Boolean).at(1);
  return routes.has(route) ? route : "dashboard";
};

const setActiveRoute = (route) => {
  routeButtons.forEach((button) => {
    button.classList.toggle("primary", button.dataset.route === route);
  });
};

const loadRoute = async (route, { push = false } = {}) => {
  setActiveRoute(route);

  if (push) {
    const nextUrl =
      route === "dashboard" ? "/spa/dashboard" : `/spa/${route}`;
    window.history.pushState({ route }, "", nextUrl);
  }

  const response = await fetch(`/partials/spa/${route}`);
  view.replaceChildren();

  if ("streamHTMLUnsafe" in Element.prototype && response.body) {
    await response.body
      .pipeThrough(new TextDecoderStream())
      .pipeTo(view.streamHTMLUnsafe());
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = await response.text();
  view.replaceChildren(template.content.cloneNode(true));
};

routeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    loadRoute(button.dataset.route, { push: true });
  });
});

window.addEventListener("popstate", () => {
  loadRoute(routeFromLocation());
});

loadRoute(routeFromLocation(), { push: window.location.pathname === "/spa" });

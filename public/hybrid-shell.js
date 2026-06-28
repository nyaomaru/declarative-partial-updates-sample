import { streamHTML } from "/public/html-stream.js";

const shellPath = "/hybrid-shell";
const partialPath = "/partials/hybrid-shell";
const defaultRoute = "dashboard";

const counter = document.querySelector("#counter");
const view = document.querySelector("#hybrid-shell-view");
const routeButtons = [...document.querySelectorAll("[data-route]")];
const routes = new Set(routeButtons.map((button) => button.dataset.route));

document.querySelector("#increment").addEventListener("click", () => {
  counter.textContent = String(Number(counter.textContent) + 1);
});

const routeFromLocation = () => {
  const route = window.location.pathname.split("/").filter(Boolean).at(1);
  return routes.has(route) ? route : defaultRoute;
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
      route === defaultRoute
        ? `${shellPath}/${defaultRoute}`
        : `${shellPath}/${route}`;
    window.history.pushState({ route }, "", nextUrl);
  }

  await streamHTML(view, await fetch(`${partialPath}/${route}`));
};

routeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    loadRoute(button.dataset.route, { push: true });
  });
});

window.addEventListener("popstate", () => {
  loadRoute(routeFromLocation());
});

loadRoute(routeFromLocation(), {
  push: window.location.pathname === shellPath,
});

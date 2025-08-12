const routes = {
  "": () => import("../pages/login.js").then(m => m.render),
  "login": () => import("../pages/login.js").then(m => m.render),
  "dashboard": () => import("../pages/dashboard.js").then(m => m.render),
};

export function initRouter(guard) {
  const nav = () => {
    const hash = location.hash.replace(/^#\/?/, "") || "login";
    const goto = routes[hash] || routes["login"];
    const can = guard ? guard(hash) : true;
    if (!can) return location.replace("#/login");
    goto().then(render => render(document.getElementById("app")));
  };
  window.addEventListener("hashchange", nav);
  nav();
}

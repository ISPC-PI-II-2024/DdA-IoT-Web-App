// ==========================
// Bootstrap de la App
// - Renderiza navbar y arranca router
// - Suscribe a store para refrescar navbar cuando cambie sesión/rol
// ==========================
import { renderNavbar } from "./components/navbar.js";
import { initRouter } from "./router/index.js";

renderNavbar();   // pinta navbar inicial
initRouter();     // monta router/guards

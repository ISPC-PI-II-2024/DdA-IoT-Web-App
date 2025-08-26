// ==========================
// Utilidades DOM (creación y montaje de nodos)
// ==========================
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Crea elemento con atributos/props y children */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v != null) node.setAttribute(k, v);
  });
  children.flat().forEach(ch => {
    if (ch == null) return;
    node.appendChild(typeof ch === "string" ? document.createTextNode(ch) : ch);
  });
  return node;
}

/** Monta (reemplaza contenido) en un contenedor */
export function mount(container, node) {
  container.innerHTML = "";
  container.appendChild(node);
}

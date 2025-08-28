// ==========================
// Componente Footer - Vanilla JS
// ==========================
export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  // Mapa del sitio
  const sitemap = `
    <nav class="footer-sitemap">
      <a href="#/dashboard">Inicio</a>
      <a href="#/sobre-nosotros">Sobre Nosotros</a>
      <a href="#/login">Acceso</a>
    </nav>
  `;

  // Derechos y aclaraciones
  const copyright = `
    <div class="footer-copy">
      &copy; ${new Date().getFullYear()} MiEmpresa. Todos los derechos reservados.<br>
      <span class="footer-legal">* Para uso interno. No compartir credenciales.</span>
    </div>
  `;

  // Redes sociales/contacto (puedes personalizar los enlaces)
  const social = `
    <div class="footer-social">
      <a href="mailto:contacto@miempresa.com" title="Email"><img src="assets/mail.svg" alt="Email"></a>
      <a href="https://wa.me/123456789" target="_blank" title="WhatsApp"><img src="assets/whatsapp.svg" alt="WhatsApp"></a>
      <a href="https://linkedin.com/in/tuempresa" target="_blank" title="LinkedIn"><img src="assets/linkedin.svg" alt="LinkedIn"></a>
      <a href="https://github.com/tuempresa" target="_blank" title="GitHub"><img src="assets/github.svg" alt="GitHub"></a>
    </div>
  `;

  footer.innerHTML = `
    <div class="footer-content">
      ${sitemap}
      ${copyright}
      ${social}
    </div>
  `;

  return footer;
}

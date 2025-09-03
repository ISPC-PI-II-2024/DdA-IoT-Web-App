# Desarrollo de Aplicaciones IoT | WebApp

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

# 📌 Proyecto IoT - Ciudad Inteligente

# 📄 Documento de Especificación Técnica – Desarrollo de Aplicación Web PWA en Vanilla JavaScript

## 1. Información General del Proyecto

- **Nombre del Proyecto**: [A definir]
- **Tipo de Proyecto**: Desarrollo de Aplicación Web Progresiva (PWA)
- **Tecnología Principal**: Vanilla JavaScript (HTML5, CSS3, JavaScript ES6+)
- **Objetivo del Proyecto**: Desarrollar una aplicación web moderna, rápida, segura y accesible que funcione como una aplicación progresiva, permitiendo instalación en dispositivos móviles y uso offline.

---

## 2. Alcance del Desarrollo

Se requiere el desarrollo completo de una **aplicación web progresiva (PWA)** utilizando únicamente tecnologías estándar del navegador (Vanilla JS), sin el uso de frameworks como React, Vue o Angular.
De ser necesario, a medida que el proyecto avance, se podrá optar por utilzar algún tipo de framework.

### 2.1. Características Principales

- **Interfaz Responsiva**: Diseño adaptable a distintos dispositivos (móviles, tablets, desktop).
- **Funcionalidad Offline**: La aplicación debe funcionar sin conexión a internet mediante el uso de un **Service Worker**.
- **Instalable**: Debe permitir instalación en dispositivos móviles (como una app nativa) desde navegadores compatibles.
- **Rápida y Eficiente**: Carga rápida, uso eficiente de recursos y cumplimiento con las mejores prácticas de rendimiento web.
- **Accesibilidad**: Cumplimiento con estándares WCAG (nivel AA) para accesibilidad web.
- **Sin Dependencias Externas**: Se evitará el uso de librerías o frameworks externos. Solo se utilizarán APIs nativas del navegador.

---

## 3. Requisitos Técnicos

### 3.1. Tecnologías a Utilizar

| Componente         | Tecnología                          |
|--------------------|-------------------------------------|
| Frontend           | HTML5, CSS3, JavaScript (ES6+)     |
| Arquitectura       | Vanilla JS (sin frameworks)        |
| Service Worker     | API de Service Worker              |
| Almacenamiento     | IndexedDB / localStorage           |
| Manifest           | `manifest.json` para PWA           |
| API de Notificaciones | Opcional (si aplica)            |
| HTTPS              | Requerido mediante certificados SSL |

### 3.2. Funcionalidades PWA Obligatorias

- ✅ **Web App Manifest** completo (nombre, íconos, tema, orientación, etc.)
- ✅ **Service Worker** registrado y funcional
- ✅ **Cacheo de recursos estáticos** (HTML, CSS, JS, imágenes)
- ✅ **Soporte Offline** (página de respaldo o contenido limitado sin conexión)
- ✅ **Iniciada con Transición Suave** (splash screen personalizado)

---

## 4. Requisitos de Seguridad

- **Certificados SSL/TLS**: La aplicación debe ser servida bajo el protocolo **HTTPS**.
  - Se requiere la configuración de certificados SSL válidos (por ejemplo, mediante Let’s Encrypt u otro proveedor confiable).
  - El dominio debe estar configurado correctamente para evitar errores de seguridad.
- **Seguridad del Service Worker**: El Service Worker debe servirse desde el origen seguro (HTTPS).
- **Protección contra XSS**: Validación y sanitización de entradas si se manejan datos dinámicos.
- **CSP (Content Security Policy)**: Implementación opcional para mayor seguridad.

---

## 5. Entregables del Proyecto

1. **Código Fuente**:
   - Código limpio, bien estructurado y comentado.
   - Organización de carpetas clara (ej: `/css`, `/js`, `/img`, etc.).

2. **Archivos PWA**:
   - `manifest.json` configurado.
   - `service-worker.js` funcional.
   - Íconos en múltiples resoluciones (192px, 512px, etc.).

3. **Documentación**:
   - Guía de instalación y despliegue.
   - Instrucciones para renovar certificados SSL (si aplica).
   - Manual técnico breve (arquitectura, cómo funciona el cacheo, etc.).

4. **Entorno de Producción**:
   - Aplicación desplegada en un servidor con dominio propio y certificado SSL activo.
   - Pruebas realizadas en Chrome, Firefox y Edge.

---

## 6. Plataformas y Navegadores Soportados

- Chrome (Android y Desktop)
- Firefox
- Edge



  
## 📄 Licencia

Este proyecto está bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para más detalles.

---

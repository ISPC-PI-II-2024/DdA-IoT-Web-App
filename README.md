# Desarrollo de Aplicaciones IoT | WebApp

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

# 📌 Proyecto IoT - Ciudad Inteligente

Este repositorio alberga el módulo **Front-End** del proyecto académico de la Tecnicatura en Telecomunicaciones del ISPC - Orientación IoT. Nuestro objetivo es crear una plataforma web moderna e intuitiva que sirva como interfaz para monitorear y gestionar una infraestructura IoT en el contexto de una ciudad inteligente.

## 🌟 Características Principales

- **Monitoreo en Tiempo Real**: Visualización instantánea de datos de sensores
- **Diseño Responsivo**: Interfaz adaptable a cualquier dispositivo
- **Arquitectura Moderna**: Desarrollado con las últimas tecnologías web
- **Seguridad Integrada**: Autenticación y autorización robusta
- **Escalabilidad**: Diseñado para crecer con las necesidades de la ciudad

---

## 🎯 Objetivos del Front-End  
- Diseñar una **interfaz gráfica amigable y responsiva** para el usuario.  
- Mostrar en tiempo real información proveniente de los sensores desplegados en la ciudad:  
  - 🚦 Estado del tráfico.  
  - 🌡️ Variables ambientales (temperatura, humedad, calidad del aire, etc.).  
  - 📡 Estado de dispositivos IoT conectados.  
  - 🔔 Alertas y notificaciones relevantes.  
- Facilitar la **interacción con el sistema IoT**, como la gestión de alertas o la visualización histórica de datos.  

---

## 🛠️ Tecnologías Recomendadas  
Para el desarrollo del Front-End, se pueden utilizar diferentes stacks de tecnologías:  

- **HTML5 + CSS3 + JavaScript** → Para un desarrollo ligero y estándar.  
- **React.js** → Recomendado para una interfaz dinámica y modular.  
- **Flutter Web** → Alternativa moderna, ideal si se busca compatibilidad con mobile y web.  
- **Frameworks de visualización de datos** (ejemplos):  
  - [Chart.js](https://www.chartjs.org/) → Gráficos de líneas, barras y radar.  
  - [Leaflet.js](https://leafletjs.com/) → Mapas interactivos para ubicar sensores y eventos.  
  - [D3.js](https://d3js.org/) → Visualización avanzada de datos.
 
---

## 📊 Alcance del Proyecto

El sistema contempla la visualización de:
🚦 Estado del tráfico vehicular.
🌡️ Condiciones ambientales (temperatura, humedad, calidad del aire).
📡 Estado de sensores y dispositivos IoT desplegados.
🔔 Alertas relevantes (accidentes, cortes de energía, contaminación elevada).
Además, el sistema se diseña para ser escalable, permitiendo en el futuro:
Integración de inteligencia artificial para análisis predictivo.
Acceso multiplataforma (Web, PWA, Mobile).

---

## 📂 Estructura del Repositorio 
### (TENTATIVO, PUEDE TENER MODIFICACIONES DURANTE EL DESARROLLO DEL PROYECTO)

```bash
📦 frontend-ciudad-inteligente
 ┣ 📂 public/          # Archivos estáticos (íconos, imágenes, favicon, etc.)
 ┣ 📂 src/
 ┃ ┣ 📂 components/    # Componentes reutilizables (navbar, cards, gráficos, etc.)
 ┃ ┣ 📂 pages/         # Vistas principales (Dashboard, Alertas, Sensores, etc.)
 ┃ ┣ 📂 services/      # Conexión con APIs o broker MQTT
 ┃ ┣ 📂 styles/        # Hojas de estilo globales
 ┃ ┗ index.js          # Punto de entrada del Front-End
 ┣ 📜 package.json      # Dependencias del proyecto
 ┣ 📜 README.md         # Documentación principal
 ┗ 📜 .gitignore        # Archivos a excluir del control de versiones
```

---

## � Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ISPC-PI-II-2024/DdA-IoT-Web-App.git
   cd DdA-IoT-Web-App
   ```

2. **Instalar dependencias**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Configurar variables de entorno**
   - Crea un archivo `.env` en la carpeta `backend` siguiendo el ejemplo de `.env.example`
   - Configura las credenciales necesarias

4. **Iniciar la aplicación**
   ```bash
   # Frontend (en una terminal)
   cd frontend
   npm start

   # Backend (en otra terminal)
   cd backend
   npm start
   ```

## 💻 Requisitos Previos

- Node.js >= 14.x
- npm >= 6.x
- Docker (opcional, para contenedores)
- Un navegador web moderno

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## �👥 Equipo

| Nombre                         | GitHub                                 |
|--------------------------------|----------------------------------------|
| Vittorio Durigutti             | [@vittoriodurigutti](https://github.com/vittoriodurigutti) |
| Jose Luis Marquez              | [@marquezjose](https://github.com/marquezjose) |
| Luciano Lujan                  | [@lucianoilujan](https://github.com/lucianoilujan) |
| Romina Vanesa Huk              | [@RoHu17](https://github.com/RoHu17) |
| Paola Natalia Alejandra Pantoja| [@PaolaaPantoja](https://github.com/PaolaaPantoja) |
| Juan Diego Gonzalez Antoniazzi | [@JDGA1997](https://github.com/JDGA1997) |

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para más detalles.

# EN CONSTRUCCION:


# Desarrollo de Aplicaciones IoT | WebApp

# 📌 Proyecto IoT - Ciudad Inteligente   

Este repositorio corresponde al módulo **Front-End** del proyecto académico de la Tecnicatura en Telecomunicaciones del ISPC - Orientación IoT.
El objetivo principal es **desarrollar una interfaz web responsiva** que permita visualizar información proveniente de una infraestructura IoT aplicada a una ciudad inteligente.

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

##

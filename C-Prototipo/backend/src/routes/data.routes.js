// --------------------------------------------------------------------
// Rutas relacionadas con la gestion de datos
// --------------------------------------------------------------------

// IMPORTACIONES
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares.js";
import dataControllers from "../controllers/data.controllers.js";

// --------------------------------------------------------------------
// FUNCIONES
// --------------------------------------------------------------------
const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// Rutas de dispositivos
router.get("/devices", dataControllers.getAllDevicesController);
router.get("/devices/:deviceId", dataControllers.getDeviceByIdController);
router.get("/devices/:deviceId/sensor-data", dataControllers.getDeviceSensorDataController);

// EXPORTACION
export default router;








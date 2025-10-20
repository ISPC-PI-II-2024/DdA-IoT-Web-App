// ==========================
// Rutas de autenticación
// ==========================
import { Router } from "express";
import { googleAuth, devLogin } from "../controllers/auth.controllers.js";

const router = Router();

router.post("/google", googleAuth);
router.post("/dev", devLogin); // Endpoint de desarrollo

export default router;

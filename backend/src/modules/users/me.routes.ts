import { Router } from "express";
import { getMeController, updateMeController, changePasswordController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// Self-service profile routes — no tenantMiddleware, since SUPER_ADMIN
// accounts (schoolId: null) need to manage their own profile too.
router.get("/", authMiddleware, getMeController);
router.put("/", authMiddleware, updateMeController);
router.post("/change-password", authMiddleware, changePasswordController);

export default router;

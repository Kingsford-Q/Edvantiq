// src/modules/auth/routes.js

import { Router } from "express";
import { register, loginController } from "./controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginController);

export default router;
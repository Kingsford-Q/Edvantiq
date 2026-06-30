// src/modules/auth/routes.js

import { Router } from "express";
import { loginController } from "./controller.js";

const router = Router();

// No public self-registration — per design spec, accounts are created by an
// Admin via /api/onboarding/* or /api/users, never via open signup.
router.post("/login", loginController);

export default router;
// src/modules/communication/message.query.routes.js

import { Router } from "express";
import { inboxController, sentController } from "./message.query.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

router.get("/inbox", authMiddleware, inboxController);
router.get("/sent", authMiddleware, sentController);

export default router;
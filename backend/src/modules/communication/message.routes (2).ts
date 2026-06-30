// src/modules/communication/message.routes.js

import { Router } from "express";
import { sendMessageController } from "./message.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/send",
  authMiddleware,
  sendMessageController
);

export default router;
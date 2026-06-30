// src/modules/schools/routes.ts

import { Router } from "express";
import { createSchoolController } from "./controller.js";

const router = Router();

router.post("/", createSchoolController);

export default router;
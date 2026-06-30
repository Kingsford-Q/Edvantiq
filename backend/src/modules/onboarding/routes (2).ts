import { Router } from "express";
import { studentOnboardingController } from "./studentOnboarding.controller.js";
import { teacherOnboardingController } from "./teacherOnboarding.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { parentOnboardingController } from "./parentOnboarding.controller.js";
import { adminOnboardingController } from "./adminOnboarding.controller.js";
import { staffOnboardingController } from "./staffOnboarding.controller.js";
import { onboardingController } from "./onboarding.controller.js";


const router = Router();

// Student onboarding
router.post(
  "/student",
  authMiddleware,
  tenantMiddleware,
  studentOnboardingController
);

// Teacher onboarding
router.post(
  "/teacher",
  authMiddleware,
  tenantMiddleware,
  teacherOnboardingController
);

router.post(
  "/parent",
  authMiddleware,
  tenantMiddleware,
  parentOnboardingController
);

router.post(
  "/admin",
  authMiddleware,
  tenantMiddleware,
  adminOnboardingController
);

router.post(
  "/staff",
  authMiddleware,
  tenantMiddleware,
  staffOnboardingController
);

router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  onboardingController
);

export default router;

import { Router } from "express";
import { createUserController, listRolesController, listUsersController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  createUserController
);

// Any authenticated member of the school can list colleagues (for message
// recipient pickers etc) — only account creation is ADMIN-restricted.
router.get(
  "/",
  authMiddleware,
  listUsersController
);

router.get(
  "/roles",
  authMiddleware,
  rbac(["ADMIN"]),
  listRolesController
);

export default router;
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

import {
  createFeeStructureController,
  createFeePaymentController,
  getStudentBalanceController,
  createInvoiceController,
  getInvoicesController,
  getInvoiceController,
} from "./fees.controller.js";

const router = Router();

/**
 * CREATE FEE STRUCTURE
 */
router.post(
  "/structure",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_FEE_STRUCTURE),
  createFeeStructureController
);

/**
 * RECORD PAYMENT
 */
router.post(
  "/payment",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.RECORD_PAYMENT),
  createFeePaymentController
);

/**
 * GET STUDENT BALANCE
 */
router.get(
  "/balance/:studentId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_FEES),
  getStudentBalanceController
);

/**
 * CREATE INVOICE
 */
router.post(
  "/invoice/:studentId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_INVOICE),
  createInvoiceController
);

/**
 * GET ALL INVOICES
 */
router.get(
  "/invoices",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_INVOICE),
  getInvoicesController
);

/**
 * GET SINGLE INVOICE
 */
router.get(
  "/invoice/:invoiceId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_INVOICE),
  getInvoiceController
);

export default router;
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

import {
  createFeeStructureController,
  getFeeStructuresController,
  getFeeStructureController,
  updateFeeStructureController,
  deleteFeeStructureController,
  createFeePaymentController,
  getFeePaymentsController,
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
 * GET ALL FEE STRUCTURES
 */
router.get(
  "/structures",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_FEES),
  getFeeStructuresController
);

/**
 * GET SINGLE FEE STRUCTURE
 */
router.get(
  "/structure/:feeId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_FEES),
  getFeeStructureController
);

/**
 * UPDATE FEE STRUCTURE
 */
router.put(
  "/structure/:feeId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.UPDATE_FEE_STRUCTURE),
  updateFeeStructureController
);

/**
 * DELETE FEE STRUCTURE
 */
router.delete(
  "/structure/:feeId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.DELETE_FEE_STRUCTURE),
  deleteFeeStructureController
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
 * GET ALL PAYMENTS
 */
router.get(
  "/payments",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_FEES),
  getFeePaymentsController
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
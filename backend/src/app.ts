import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./modules/auth/routes.js";
import userRoutes from "./modules/users/routes.js";
import schoolRoutes from "./modules/schools/routes.js";
import studentRoutes from "./modules/students/routes.js";
import enrollmentRoutes from "./modules/enrollments/routes.js";
import classRoutes from "./modules/classes/routes.js";
import subjectRoutes from "./modules/subjects/routes.js";
import teacherAssignmentRoutes from "./modules/teacherAssignments/routes.js";
import attendanceRoutes from "./modules/attendance/routes.js";
import academicRoutes from "./modules/academics/routes.js";
import resultRoutes from "./modules/academics/results.routes.js";
import feeRoutes from "./modules/fees/routes.js";
import communicationRoutes from "./modules/communication/routes.js";
import messageRoutes from "./modules/communication/message.routes.js";
import messageQueryRoutes from "./modules/communication/message.query.routes.js";
import notificationRoutes from "./modules/communication/notification.routes.js";
import teacherRoutes from "./modules/teachers/routes.js";
import accessRequestRoutes from "./modules/accessRequests/routes.js";
import auditRoutes from "./modules/audit/routes.js";
import onboardingRoutes from "./modules/onboarding/routes.js";


import { authMiddleware } from "./middleware/authMiddleware.js";
import { tenantMiddleware } from "./middleware/tenantMiddleware.js";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim());

if (!allowedOrigins && process.env.NODE_ENV === "production") {
  throw new Error(
    "ALLOWED_ORIGINS must be set in production (comma-separated list of allowed origins)"
  );
}

app.use(helmet());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : undefined));
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "API is working properly" });
});

app.get("/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: (req as any).user,
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/schools", schoolRoutes);

app.use("/api/onboarding", onboardingRoutes);

app.use(authMiddleware);
app.use(tenantMiddleware);

app.use("/api/users", userRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/assignments", teacherAssignmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/academics", academicRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/messages", messageQueryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/audit", auditRoutes);

export default app;
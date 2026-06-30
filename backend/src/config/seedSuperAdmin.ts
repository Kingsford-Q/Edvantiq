import "dotenv/config";
import { prisma } from "../prisma.js";
import { hashPassword } from "../utils/password.js";

/**
 * One-time bootstrap for the platform's first SUPER_ADMIN account.
 * Run with: npm run seed:super-admin
 * Requires SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME in .env.
 * Idempotent — safe to re-run; does nothing if the account already exists.
 */
async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const fullName = process.env.SUPER_ADMIN_NAME;

  if (!email || !password || !fullName) {
    throw new Error(
      "Set SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD and SUPER_ADMIN_NAME in .env before running this script"
    );
  }

  if (password.length < 12) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 12 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Super Admin already exists for ${email}, nothing to do.`);
    return;
  }

  // Platform-level role: no schoolId, shared by all Super Admins.
  let role = await prisma.role.findFirst({
    where: { name: "SUPER_ADMIN", schoolId: null },
  });

  if (!role) {
    role = await prisma.role.create({
      data: { name: "SUPER_ADMIN", isSystem: true, schoolId: null },
    });
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      password: hashed,
      schoolId: null,
      roleId: role.id,
    },
  });

  console.log(`Super Admin created: ${user.email} (${user.id})`);
}

seedSuperAdmin()
  .catch((err) => {
    console.error("Failed to seed Super Admin:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

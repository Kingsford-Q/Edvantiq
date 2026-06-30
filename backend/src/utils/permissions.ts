import { prisma } from "../prisma.js";

export async function hasPermission(userId: string, action: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user || !user.role) return false;

  return user.role.permissions.some(
    (perm) => perm.action === action
  );
}
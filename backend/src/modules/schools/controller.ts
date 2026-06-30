import type { Request, Response } from "express";
import { createSchool, setupSchoolDefaults } from "./service.js";
import { prisma } from "../../prisma.js";
import { hashPassword } from "../../utils/password.js";

export async function createSchoolController(req: Request, res: Response) {
  try {
    const { name, type, location, adminEmail, adminPassword, adminName } = req.body;

    const school = await createSchool({ name, type, location });

    const hashedPassword = await hashPassword(adminPassword);

    await setupSchoolDefaults(school.id);

    const adminRole = await prisma.role.findFirst({
      where: { name: "ADMIN", schoolId: school.id },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: adminName,
        password: hashedPassword,
        schoolId: school.id,
        roleId: adminRole!.id,
      },
    });

    res.status(201).json({
      message: "School + Admin created successfully",
      school,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
import type { Request, Response } from "express";
import { createSchool, setupSchoolDefaults, listSchools, getSchoolById, updateSchool } from "./service.js";
import { prisma } from "../../prisma.js";
import { hashPassword } from "../../utils/password.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";

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
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function listSchoolsController(req: Request, res: Response) {
  try {
    const schools = await listSchools();
    res.status(200).json(schools);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getSchoolController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const requestedId = req.params.id as string;

    // ADMIN/etc can only view their own school; SUPER_ADMIN can view any.
    if (user.role !== "SUPER_ADMIN" && user.schoolId !== requestedId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const school = await getSchoolById(requestedId);
    res.status(200).json(school);
  } catch (error: any) {
    res.status(404).json({ message: safeErrorMessage(error) });
  }
}

export async function updateSchoolController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const requestedId = req.params.id as string;

    if (user.role !== "SUPER_ADMIN" && user.schoolId !== requestedId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const school = await updateSchool(requestedId, sanitizeUpdate(req.body));
    res.status(200).json(school);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}
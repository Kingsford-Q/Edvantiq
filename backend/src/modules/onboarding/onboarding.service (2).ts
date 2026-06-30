import { onboardStudent } from "./studentOnboarding.service.js";
import { onboardTeacher } from "./teacherOnboarding.service.js";
import { onboardParent } from "./parentOnboarding.service.js";
import { onboardAdmin } from "./adminOnboarding.service.js";
import { onboardStaff } from "./staffOnboarding.service.js";

export async function onboardUser(data: {
  type: "STUDENT" | "TEACHER" | "PARENT" | "ADMIN" | "STAFF";
  payload: any;
  schoolId: string;
}) {
  switch (data.type) {
    case "STUDENT":
      return onboardStudent({
        ...data.payload,
        schoolId: data.schoolId,
      });

    case "TEACHER":
      return onboardTeacher({
        ...data.payload,
        schoolId: data.schoolId,
      });

    case "PARENT":
      return onboardParent({
        ...data.payload,
        schoolId: data.schoolId,
      });

    case "ADMIN":
      return onboardAdmin({
        ...data.payload,
        schoolId: data.schoolId,
      });

    case "STAFF":
      return onboardStaff({
        ...data.payload,
        schoolId: data.schoolId,
      });

    default:
      throw new Error("Invalid onboarding type");
  }
}
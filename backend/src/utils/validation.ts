export const studentSchema = {
  fullName: "required",
  indexNo: "optional",
  classId: "required",
};

export const teacherSchema = {
  fullName: "required",
  email: "required",
  password: "required",
  subject: "optional",
};

export const parentSchema = {
  fullName: "required",
  email: "required",
  studentIds: "required",
};

export const staffSchema = {
  fullName: "required",
  email: "required",
  password: "required",
  position: "required",
};
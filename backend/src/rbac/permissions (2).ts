export const PERMISSIONS = {
  // ======================
  // STUDENTS
  // ======================
  CREATE_STUDENT: "CREATE_STUDENT",
  UPDATE_STUDENT: "UPDATE_STUDENT",
  VIEW_STUDENT: "VIEW_STUDENT",
  DELETE_STUDENT: "DELETE_STUDENT",

  // ======================
  // TEACHERS
  // ======================
  CREATE_TEACHER: "CREATE_TEACHER",
  VIEW_TEACHER: "VIEW_TEACHER",

  // ======================
  // ATTENDANCE (IMPORTANT)
  // ======================
  CREATE_ATTENDANCE_SESSION: "CREATE_ATTENDANCE_SESSION",
  MARK_ATTENDANCE: "MARK_ATTENDANCE",
  VIEW_ATTENDANCE: "VIEW_ATTENDANCE",

  // ======================
  // RESULTS / ACADEMICS
  // ======================
  CREATE_ASSESSMENT: "CREATE_ASSESSMENT",
  ENTER_RESULTS: "ENTER_RESULTS",
  VIEW_RESULTS: "VIEW_RESULTS",

  // ======================
  // FEES
  // ======================
  CREATE_FEE_STRUCTURE: "CREATE_FEE_STRUCTURE",
  VIEW_FEES: "VIEW_FEES",
  RECORD_PAYMENT: "RECORD_PAYMENT",

  // ======================
  // INVOICES
  // ======================
  CREATE_INVOICE: "CREATE_INVOICE",
  VIEW_INVOICE: "VIEW_INVOICE",

  // ======================
  // ONBOARDING
  // ======================
  ONBOARD_STUDENT: "ONBOARD_STUDENT",
  ONBOARD_TEACHER: "ONBOARD_TEACHER",
  ONBOARD_PARENT: "ONBOARD_PARENT",

  // ======================
  // SCHOOL ADMIN
  // ======================
  MANAGE_SCHOOL: "MANAGE_SCHOOL",
  MANAGE_USERS: "MANAGE_USERS",
} as const;
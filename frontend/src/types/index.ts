// User and Auth types
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  schoolId?: string | null;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SchoolRole {
  id: string;
  name: string;
  isSystem: boolean;
  schoolId: string | null;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  profileImageUrl?: string;
  role: { name: string } | null;
}

// School types
export interface School {
  id: string;
  name: string;
  type: 'BASIC' | 'SECONDARY' | 'TERTIARY';
  location: string;
  createdAt: string;
}

// Student types
export interface Student {
  id: string;
  fullName: string;
  indexNo?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  address?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  schoolId: string;
  userId?: string;
  enrollments?: Enrollment[];
  attendanceRecords?: AttendanceRecord[];
  results?: AssessmentResult[];
}

// Teacher types
export interface Teacher {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  qualification?: string;
  employmentType?: string;
  hireDate?: string;
  profileImageUrl?: string;
  subject?: string;
  schoolId: string;
  userId?: string;
  assignments?: TeacherAssignment[];
}

// Class types
export interface Class {
  id: string;
  name: string;
  level?: string;
  schoolId: string;
  enrollments?: Enrollment[];
  teacherAssignments?: TeacherAssignment[];
  feeStructures?: FeeStructure[];
}

// Subject types
export interface Subject {
  id: string;
  name: string;
  schoolId: string;
  teacherAssignments?: TeacherAssignment[];
  assessments?: Assessment[];
}

// Enrollment
export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  student?: Student;
  class?: Class;
}

// Teacher Assignment
export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  teacher?: Teacher;
  class?: Class;
  subject?: Subject;
}

// Attendance types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceSession {
  id: string;
  classId: string;
  subjectId?: string;
  teacherId: string;
  date: string;
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
  records?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  student?: Student;
}

// Assessment types
export type AssessmentType = 'CA' | 'EXAM' | 'QUIZ';

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  totalMark: number;
  classId: string;
  subjectId: string;
  academicYearId?: string;
  results?: AssessmentResult[];
  class?: Class;
  subject?: Subject;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  remark?: string;
  assessment?: Assessment;
  student?: Student;
}

// Fee types
export interface FeeStructure {
  id: string;
  title: string;
  amount: number;
  term?: string;
  classId: string;
  academicYearId?: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  feeId: string;
  amountPaid: number;
  method: string;
  date: string;
  student?: Student;
  fee?: FeeStructure;
}

export interface StudentFee {
  id: string;
  studentId: string;
  feeId: string;
  amountDue: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  student?: Student;
  InvoiceItem?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  feeId: string;
  amount: number;
  feeStructureId?: string;
}

// Communication types
export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// Access Request types
export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccessRequest {
  id: string;
  schoolId: string;
  requestedById: string;
  status: AccessRequestStatus;
  expiresAt?: string;
  createdAt: string;
  school?: School;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  schoolId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// API Error
export interface ApiError {
  message: string;
  statusCode?: number;
}

import type {
  AuthResponse,
  User,
  School,
  Student,
  Teacher,
  Class,
  Subject,
  Enrollment,
  TeacherAssignment,
  AttendanceSession,
  AttendanceRecord,
  Assessment,
  AssessmentResult,
  FeeStructure,
  FeePayment,
  Invoice,
  Announcement,
  Message,
  Notification,
  AccessRequest,
  AuditLog,
  SchoolRole,
  UserSummary,
} from '../types';

const API_BASE = 'http://localhost:5000/api';
const ACTIVE_SCHOOL_KEY = 'activeSchoolId';
const ACTIVE_SCHOOL_NAME_KEY = 'activeSchoolName';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Super Admins have no home school — when they've been granted access to one,
  // this is the school they're currently "inside" (sent as x-school-id).
  getActiveSchoolId(): string | null {
    return localStorage.getItem(ACTIVE_SCHOOL_KEY);
  }

  getActiveSchoolName(): string | null {
    return localStorage.getItem(ACTIVE_SCHOOL_NAME_KEY);
  }

  setActiveSchool(school: { id: string; name: string } | null): void {
    if (school) {
      localStorage.setItem(ACTIVE_SCHOOL_KEY, school.id);
      localStorage.setItem(ACTIVE_SCHOOL_NAME_KEY, school.name);
    } else {
      localStorage.removeItem(ACTIVE_SCHOOL_KEY);
      localStorage.removeItem(ACTIVE_SCHOOL_NAME_KEY);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const activeSchoolId = this.getActiveSchoolId();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(activeSchoolId ? { 'x-school-id': activeSchoolId } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Schools
  async createSchool(data: {
    name: string;
    type: string;
    location: string;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
  }): Promise<School> {
    return this.request<School>('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSchools(): Promise<School[]> {
    return this.request<School[]>('/schools');
  }

  async getSchoolById(id: string): Promise<School> {
    return this.request<School>(`/schools/${id}`);
  }

  async updateSchool(id: string, data: Partial<School>): Promise<School> {
    return this.request<School>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Onboarding
  async onboardStudent(data: {
    fullName: string;
    indexNo?: string;
    classId: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    phoneNumber?: string;
  }): Promise<Student> {
    return this.request<Student>('/onboarding/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async onboardTeacher(data: {
    fullName: string;
    email: string;
    password: string;
    subject?: string;
    phoneNumber?: string;
    address?: string;
    qualification?: string;
    employmentType?: string;
    hireDate?: string;
  }): Promise<Teacher> {
    return this.request<Teacher>('/onboarding/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async onboardParent(data: {
    fullName: string;
    email: string;
    password: string;
    studentIds: string[];
    phoneNumber?: string;
    address?: string;
  }): Promise<User> {
    return this.request<User>('/onboarding/parent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async onboardAdmin(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<User> {
    return this.request<User>('/onboarding/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async onboardStaff(data: {
    fullName: string;
    email: string;
    password: string;
    position: string;
  }): Promise<User> {
    return this.request<User>('/onboarding/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Self-service profile
  async getMe(): Promise<User> {
    return this.request<User>('/me');
  }

  async updateMe(data: {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    profileImageUrl?: string;
  }): Promise<User> {
    return this.request<User>('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/me/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Users / Roles (Admin)
  async getRoles(): Promise<SchoolRole[]> {
    return this.request<SchoolRole[]>('/users/roles');
  }

  async getUsers(): Promise<UserSummary[]> {
    return this.request<UserSummary[]>('/users');
  }

  async createUserAccount(data: {
    email: string;
    password: string;
    fullName: string;
    roleId: string;
  }): Promise<{ id: string; email: string; fullName: string }> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return this.request<Student[]>('/students');
  }

  async getMyStudentProfile(): Promise<Student> {
    return this.request<Student>('/students/me');
  }

  async getMyChildren(): Promise<Student[]> {
    return this.request<Student[]>('/students/my-children');
  }

  async getStudent(id: string): Promise<Student> {
    return this.request<Student>(`/students/${id}`);
  }

  async createStudent(data: Partial<Student>): Promise<Student> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    return this.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: string): Promise<void> {
    return this.request<void>(`/students/${id}`, { method: 'DELETE' });
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    return this.request<Teacher[]>('/teachers');
  }

  async getTeacher(id: string): Promise<Teacher> {
    return this.request<Teacher>(`/teachers/${id}`);
  }

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    return this.request<Teacher>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher> {
    return this.request<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id: string): Promise<void> {
    return this.request<void>(`/teachers/${id}`, { method: 'DELETE' });
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    return this.request<Class[]>('/classes');
  }

  async getClass(id: string): Promise<Class> {
    return this.request<Class>(`/classes/${id}`);
  }

  async createClass(data: { name: string; level?: string }): Promise<Class> {
    return this.request<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClass(id: string, data: Partial<Class>): Promise<Class> {
    return this.request<Class>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClass(id: string): Promise<void> {
    return this.request<void>(`/classes/${id}`, { method: 'DELETE' });
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/subjects');
  }

  async getSubject(id: string): Promise<Subject> {
    return this.request<Subject>(`/subjects/${id}`);
  }

  async createSubject(data: { name: string }): Promise<Subject> {
    return this.request<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    return this.request<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: string): Promise<void> {
    return this.request<void>(`/subjects/${id}`, { method: 'DELETE' });
  }

  // Enrollments
  async createEnrollment(data: { studentId: string; classId: string }): Promise<Enrollment> {
    return this.request<Enrollment>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Teacher Assignments
  async createAssignment(data: {
    teacherId: string;
    classId: string;
    subjectId: string;
  }): Promise<TeacherAssignment> {
    return this.request<TeacherAssignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Attendance
  async createAttendanceSession(data: {
    classId: string;
    subjectId?: string;
    date: string;
  }): Promise<AttendanceSession> {
    return this.request<AttendanceSession>('/attendance/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markAttendance(data: {
    sessionId: string;
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
  }): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceSessions(): Promise<AttendanceSession[]> {
    return this.request<AttendanceSession[]>('/attendance/sessions');
  }

  async getAttendanceRecords(sessionId: string): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>(`/attendance/${sessionId}`);
  }

  // Assessments
  async getAssessments(): Promise<Assessment[]> {
    return this.request<Assessment[]>('/academics/assessment');
  }

  async getAssessment(id: string): Promise<Assessment> {
    return this.request<Assessment>(`/academics/assessment/${id}`);
  }

  async createAssessment(data: {
    title: string;
    type: 'CA' | 'EXAM' | 'QUIZ';
    totalMark: number;
    classId: string;
    subjectId: string;
    academicYearId?: string;
  }): Promise<Assessment> {
    return this.request<Assessment>('/academics/assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment> {
    return this.request<Assessment>(`/academics/assessment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAssessment(id: string): Promise<void> {
    return this.request<void>(`/academics/assessment/${id}`, { method: 'DELETE' });
  }

  // Results
  async enterResult(data: {
    assessmentId: string;
    studentId: string;
    score: number;
    remark?: string;
  }): Promise<AssessmentResult> {
    return this.request<AssessmentResult>('/results/enter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getResults(): Promise<AssessmentResult[]> {
    return this.request<AssessmentResult[]>('/results');
  }

  async getStudentResults(studentId: string): Promise<AssessmentResult[]> {
    return this.request<AssessmentResult[]>(`/results/student/${studentId}`);
  }

  // Fees
  async getFeeStructures(): Promise<FeeStructure[]> {
    return this.request<FeeStructure[]>('/fees/structures');
  }

  async getFeeStructure(id: string): Promise<FeeStructure> {
    return this.request<FeeStructure>(`/fees/structure/${id}`);
  }

  async createFeeStructure(data: {
    title: string;
    amount: number;
    term?: string;
    classId: string;
    academicYearId?: string;
  }): Promise<FeeStructure> {
    return this.request<FeeStructure>('/fees/structure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeeStructure(id: string, data: Partial<FeeStructure>): Promise<FeeStructure> {
    return this.request<FeeStructure>(`/fees/structure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFeeStructure(id: string): Promise<void> {
    return this.request<void>(`/fees/structure/${id}`, { method: 'DELETE' });
  }

  async recordPayment(data: {
    studentId: string;
    feeId: string;
    amountPaid: number;
    method: string;
  }): Promise<FeePayment> {
    return this.request<FeePayment>('/fees/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeeBalance(studentId: string): Promise<{
    totalFees: number;
    totalPaid: number;
    balance: number;
  }> {
    return this.request(`/fees/balance/${studentId}`);
  }

  async createInvoice(studentId: string): Promise<Invoice> {
    return this.request<Invoice>(`/fees/invoice/${studentId}`, { method: 'POST' });
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.request<Invoice[]>('/fees/invoices');
  }

  async getInvoice(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/fees/invoice/${id}`);
  }

  async getFeePayments(): Promise<FeePayment[]> {
    return this.request<FeePayment[]>('/fees/payments');
  }

  // Communication
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request<Announcement[]>('/communication/announcements');
  }

  async getAnnouncement(id: string): Promise<Announcement> {
    return this.request<Announcement>(`/communication/announcement/${id}`);
  }

  async createAnnouncement(data: {
    title: string;
    message: string;
    type: string;
  }): Promise<Announcement> {
    return this.request<Announcement>('/communication/announcement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnnouncement(
    id: string,
    data: { title?: string; message?: string; type?: string }
  ): Promise<Announcement> {
    return this.request<Announcement>(`/communication/announcement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.request<void>(`/communication/announcement/${id}`, { method: 'DELETE' });
  }

  async sendMessage(data: { receiverId?: string; content: string }): Promise<Message> {
    return this.request<Message>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(): Promise<Message[]> {
    return this.request<Message[]>('/messages');
  }

  async getInbox(): Promise<Message[]> {
    return this.request<Message[]>('/messages/inbox');
  }

  async getSentMessages(): Promise<Message[]> {
    return this.request<Message[]>('/messages/sent');
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications');
  }

  // Access Requests (Super Admin)
  async requestAccess(schoolId: string): Promise<AccessRequest> {
    return this.request<AccessRequest>('/access-requests/request', {
      method: 'POST',
      body: JSON.stringify({ schoolId }),
    });
  }

  async getAccessRequests(): Promise<AccessRequest[]> {
    return this.request<AccessRequest[]>('/access-requests');
  }

  async getMyAccessRequests(): Promise<AccessRequest[]> {
    return this.request<AccessRequest[]>('/access-requests/mine');
  }

  async approveAccessRequest(id: string): Promise<AccessRequest> {
    return this.request<AccessRequest>(`/access-requests/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectAccessRequest(id: string): Promise<AccessRequest> {
    return this.request<AccessRequest>(`/access-requests/${id}/reject`, {
      method: 'PATCH',
    });
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/audit');
  }
}

export const api = new ApiClient();

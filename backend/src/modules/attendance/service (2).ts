// src/modules/attendance/service.ts

import { prisma } from "../../prisma.js";

export async function createAttendanceSession(data: {
  classId: string;
  subjectId?: string;
  teacherId: string;
  schoolId: string;
  date: string;
}) {
  return prisma.attendanceSession.create({
    data: {
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      schoolId: data.schoolId,
      date: new Date(data.date),
    },
  });
}


export async function markAttendance(data: {
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}) {
  return prisma.attendanceRecord.create({
    data: {
      sessionId: data.sessionId,
      studentId: data.studentId,
      status: data.status,
    },
  });
}
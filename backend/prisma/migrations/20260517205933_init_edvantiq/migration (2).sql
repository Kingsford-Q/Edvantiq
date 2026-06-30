/*
  Warnings:

  - You are about to drop the column `class` on the `Student` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Assessment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `AttendanceRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('CA', 'EXAM', 'QUIZ');

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_schoolId_fkey";

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "academicYearId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "AssessmentType" NOT NULL;

-- AlterTable
ALTER TABLE "AttendanceRecord" DROP COLUMN "status",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL;

-- AlterTable
ALTER TABLE "AttendanceSession" ADD COLUMN     "academicYearId" TEXT;

-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "academicYearId" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "schoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "class";

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

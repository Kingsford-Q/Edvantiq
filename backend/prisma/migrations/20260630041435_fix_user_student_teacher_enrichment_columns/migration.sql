-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profileImageUrl" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "hireDate" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "qualification" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "staffCode" TEXT;

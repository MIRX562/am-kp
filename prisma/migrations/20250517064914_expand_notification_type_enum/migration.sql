-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'INFO';
ALTER TYPE "NotificationType" ADD VALUE 'SUCCESS';
ALTER TYPE "NotificationType" ADD VALUE 'WARNING';
ALTER TYPE "NotificationType" ADD VALUE 'ERROR';
ALTER TYPE "NotificationType" ADD VALUE 'MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE 'BILLING';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM';
ALTER TYPE "NotificationType" ADD VALUE 'MAINTENANCE';

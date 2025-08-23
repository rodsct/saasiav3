-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ChatbotModel" AS ENUM ('MODEL_A', 'MODEL_B', 'MODEL_C');

-- AlterTable
ALTER TABLE "public"."Chatbot" ADD COLUMN     "model" "public"."ChatbotModel" NOT NULL DEFAULT 'MODEL_A',
ALTER COLUMN "n8nWebhookUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

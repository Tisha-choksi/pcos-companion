-- CreateEnum
CREATE TYPE "Phenotype" AS ENUM ('INSULIN_RESISTANT', 'INFLAMMATORY', 'ADRENAL', 'LEAN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FlowIntensity" AS ENUM ('SPOTTING', 'LIGHT', 'MEDIUM', 'HEAVY');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "date_of_birth" DATE,
    "height_cm" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "diagnosed_at" DATE,
    "phenotype" "Phenotype",
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "flow_intensity" "FlowIntensity",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cycles_profile_id_start_date_idx" ON "cycles"("profile_id", "start_date");

-- AddForeignKey
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

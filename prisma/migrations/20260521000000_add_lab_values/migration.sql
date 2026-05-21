-- CreateTable for lab values tracking
CREATE TABLE "lab_values" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "test_name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "range" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lab_values_profile_id_date_idx" ON "lab_values"("profile_id", "date");

-- CreateIndex
CREATE INDEX "lab_values_profile_id_test_name_date_idx" ON "lab_values"("profile_id", "test_name", "date");

-- AddForeignKey
ALTER TABLE "lab_values" ADD CONSTRAINT "lab_values_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

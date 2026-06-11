-- Drop the password_reset table and its constraints
DROP TABLE IF EXISTS "password_reset";

-- Drop the old verification table
DROP TABLE IF EXISTS "verification";

-- Drop the foreign key constraint on the old verification table if it still exists
-- (already dropped with the table, but just to be safe)

-- Create the new generic verification table
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- Create unique index on value (token)
CREATE UNIQUE INDEX "verification_value_key" ON "verification"("value");

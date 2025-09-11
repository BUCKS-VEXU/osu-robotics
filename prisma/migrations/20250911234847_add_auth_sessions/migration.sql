-- CreateTable
CREATE TABLE "public"."Auth_Sessions" (
    "sid" VARCHAR(255) NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Auth_Sessions_pkey" PRIMARY KEY ("sid")
);

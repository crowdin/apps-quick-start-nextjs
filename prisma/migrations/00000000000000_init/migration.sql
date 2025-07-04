-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "domain" TEXT,
    "organizationId" INTEGER NOT NULL,
    "appId" TEXT NOT NULL,
    "appSecret" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessTokenExpires" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
); 
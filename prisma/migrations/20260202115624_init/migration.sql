-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FigmaElement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "figmaUrl" TEXT NOT NULL,
    "figmaFileKey" TEXT,
    "figmaNodeId" TEXT,
    "imagePath" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "imageSize" INTEGER NOT NULL,
    "tags" JSONB,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FigmaElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElementState" (
    "id" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "condition" TEXT,
    "severity" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ElementState_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FigmaElement" ADD CONSTRAINT "FigmaElement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElementState" ADD CONSTRAINT "ElementState_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "FigmaElement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ElementState_elementId_sortOrder_idx" ON "ElementState"("elementId", "sortOrder");

import { PrismaClient, ElementStateType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingProject = await prisma.project.findFirst({
    where: { name: "Core UI Library" },
  });

  const project =
    existingProject ??
    (await prisma.project.create({
      data: {
        name: "Core UI Library",
        description: "Shared UI patterns and copy guidelines.",
      },
    }));

  const element = await prisma.figmaElement.create({
    data: {
      title: "Login Form",
      figmaUrl: "https://www.figma.com/file/AbCdEFgHiJKlMnOP/Design-System?node-id=120%3A880",
      figmaFileKey: "AbCdEFgHiJKlMnOP",
      figmaNodeId: "120:880",
      imagePath: "/uploads/sample-element.svg",
      imageName: "sample-element.svg",
      imageType: "image/svg+xml",
      imageSize: 1421,
      projectId: project.id,
      states: {
        create: [
          {
            type: ElementStateType.error,
            title: "Invalid credentials",
            message: "Email or password is incorrect. Try again.",
            condition: "When auth fails",
            severity: "High",
            locale: "en",
            sortOrder: 1,
          },
          {
            type: ElementStateType.warning,
            title: "Caps lock on",
            message: "Caps Lock is on. Passwords are case sensitive.",
            condition: "When user toggles Caps Lock",
            severity: "Low",
            locale: "en",
            sortOrder: 2,
          },
          {
            type: ElementStateType.helper,
            title: "Password hint",
            message: "Use at least 8 characters with a mix of letters and numbers.",
            condition: "Default helper copy",
            severity: "Low",
            locale: "en",
            sortOrder: 3,
          },
          {
            type: ElementStateType.accessibility,
            title: "Screen reader hint",
            message: "Password field requires at least 8 characters.",
            condition: "Screen reader description",
            severity: "Medium",
            locale: "en",
            sortOrder: 4,
          },
        ],
      },
    },
  });

  await prisma.figmaElement.update({
    where: { id: element.id },
    data: { updatedAt: new Date() },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

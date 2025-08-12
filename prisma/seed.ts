import { PrismaClient,TeamRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "password123";

  // Hash password
  const hashedPassword = await hash(adminPassword, 10);

  // Upsert user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  // after creating admin user...
  const team = await prisma.team.create({
    data: {
      name: "Product Launch",
      members: {
        create: {
          userId: admin.id,
          role:TeamRole.MANAGER
        },
      },
    },
  });
  console.log("✅ Created team:", team.name);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });


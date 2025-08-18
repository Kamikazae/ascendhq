import { PrismaClient, TeamRole, Role, Status } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const usersData = [
    { name: "Admin User", email: "admin@example.com", role: Role.ADMIN },
    { name: "John Manager", email: "manager@example.com", role: Role.MANAGER },
    { name: "Jane Member", email: "member1@example.com", role: Role.MEMBER },
    { name: "Bob Member", email: "member2@example.com", role: Role.MEMBER },
  ];

  const passwordHash = await hash("password123", 10);

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          password: passwordHash,
        },
      })
    )
  );

  console.log(`✅ Created ${users.length} users`);

  // Create Teams with members
  const team1 = await prisma.team.create({
    data: {
      name: "Product Launch",
      members: {
        create: [
          { userId: users[0].id, role: TeamRole.MANAGER },
          { userId: users[2].id, role: TeamRole.MEMBER },
          { userId: users[3].id, role: TeamRole.MEMBER },
        ],
      },
    },
    include: { members: true },
  });

  const team2 = await prisma.team.create({
    data: {
      name: "Website Redesign",
      members: {
        create: [
          { userId: users[1].id, role: TeamRole.MANAGER },
          { userId: users[2].id, role: TeamRole.MEMBER },
        ],
      },
    },
    include: { members: true },
  });

  console.log(`✅ Created teams: ${team1.name}, ${team2.name}`);

  // Create Objectives for team1
  const objective1 = await prisma.objective.create({
    data: {
      title: "Launch Marketing Campaign",
      description: "Prepare and launch the marketing campaign for the new product.",
      teamId: team1.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days later
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), // 20 days later
      status: Status.ON_TRACK,
      keyResults: {
        create: [
          {
            title: "Get 5000 signups",
            targetValue: 5000,
            currentValue: 1200,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
            progress: 24,
            updates: {
              create: [
                {
                  userId: users[2].id,
                  newValue: 800,
                  comment: "Initial push from email list",
                },
                {
                  userId: users[3].id,
                  newValue: 1200,
                  comment: "Social media ads working well",
                },
              ],
            },
          },
          {
            title: "Reach 50 media mentions",
            targetValue: 50,
            currentValue: 10,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
            progress: 20,
          },
        ],
      },
    },
  });

  // Create Objectives for team2
 // Create Objectives for team2
const objective2 = await prisma.objective.create({
  data: {
    title: "Launch New Website",
    description: "Complete redesign of company website with new branding.",
    teamId: team2.id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
    status: Status.AT_RISK,
    keyResults: {
      create: [
        {
          title: "Complete all UI pages",
          targetValue: 20,
          currentValue: 8,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
          progress: 40,
          updates: {
            create: [
              {
                userId: users[2].id, // Jane Member
                newValue: 5,
                comment: "Built homepage and about page",
              },
              {
                userId: users[1].id, // John Manager
                newValue: 8,
                comment: "Reviewed UI progress, approved designs",
              },
            ],
          },
        },
        {
          title: "Achieve 90+ Lighthouse score",
          targetValue: 90,
          currentValue: 75,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
          progress: 83,
          updates: {
            create: [
              {
                userId: users[3].id, // Bob Member
                newValue: 70,
                comment: "Optimized images, performance improved",
              },
              {
                userId: users[1].id, // John Manager
                newValue: 75,
                comment: "Accessibility fixes pushed, score improved",
              },
            ],
          },
        },
      ],
    },
  },
});

  

  console.log(`✅ Created objectives: ${objective1.title}, ${objective2.title}`);
}

main()
  .then(() => {
    console.log("🌱 Seeding complete!");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

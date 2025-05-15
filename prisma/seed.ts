import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Hash passwords
  const testUserPassword = await bcrypt.hash("test123", 10)

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      password: testUserPassword,
      role: "user",
      balance: 100,
    },
  })

  console.log(`Created test user: ${testUser.email}`)

  // Create sample deposits
  const deposit1 = await prisma.deposit.create({
    data: {
      amount: 50,
      method: "UPI",
      screenshot: "deposit1.jpg",
      status: "verified",
      userId: testUser.id,
    },
  })

  const deposit2 = await prisma.deposit.create({
    data: {
      amount: 75,
      method: "Crypto",
      screenshot: "deposit2.jpg",
      status: "pending",
      userId: testUser.id,
    },
  })

  console.log(`Created ${2} sample deposits`)

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      quantity: 1000,
      country: "US",
      device: "mobile",
      cost: 50,
      status: "completed",
      progress: 100,
      userId: testUser.id,
    },
  })

  const order2 = await prisma.order.create({
    data: {
      quantity: 2000,
      country: "UK",
      device: "desktop",
      cost: 180,
      status: "running",
      progress: 45,
      userId: testUser.id,
    },
  })

  console.log(`Created ${2} sample orders`)

  console.log("Database has been seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

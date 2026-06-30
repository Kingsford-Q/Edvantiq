import app from "./app.js";
import { prisma } from "./prisma.js";
import "dotenv/config";
import { seedRoles } from "./config/seed.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("🟢 Prisma connected");

    await seedRoles("8212049d-aa9b-41a8-ba91-bc170de8d0b6");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();
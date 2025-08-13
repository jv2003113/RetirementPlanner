import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { standardMilestones, type InsertStandardMilestone } from "../shared/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const newMilestone: InsertStandardMilestone = {
  title: "HSA Triple Tax Advantage",
  description: "Health Savings Account contributions, growth, and withdrawals for medical expenses are all tax-free",
  targetAge: 55,
  category: "healthcare", 
  icon: "shield",
  isActive: true,
  sortOrder: 2,
};

async function addTestMilestone() {
  try {
    console.log("Adding test milestone...");
    
    const result = await db.insert(standardMilestones).values(newMilestone).returning();
    
    console.log(`✅ Successfully added milestone: ${result[0].title} at age ${result[0].targetAge}`);
    
    // Fetch and display all milestones
    const allMilestones = await db.select().from(standardMilestones).orderBy(standardMilestones.targetAge);
    console.log("\nAll standard milestones:");
    allMilestones.forEach(milestone => {
      console.log(`- Age ${milestone.targetAge}: ${milestone.title}`);
    });
    
  } catch (error) {
    console.error("❌ Error adding milestone:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addTestMilestone();
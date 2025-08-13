import { drizzle } from "drizzle-orm/neon-http";
import { standardMilestones, type InsertStandardMilestone } from "../shared/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const db = drizzle(process.env.DATABASE_URL);

const defaultStandardMilestones: InsertStandardMilestone[] = [
  {
    title: "Catch-up Contributions",
    description: "Eligible for additional 401(k) and IRA contributions",
    targetAge: 50,
    category: "financial",
    icon: "dollar-sign",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Early Social Security",
    description: "Eligible for reduced Social Security benefits (75% of full benefit)",
    targetAge: 62,
    category: "retirement",
    icon: "clock",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Medicare Eligibility",
    description: "Eligible for Medicare health insurance",
    targetAge: 65,
    category: "healthcare",
    icon: "shield",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Full Retirement Age",
    description: "Eligible for full Social Security benefits",
    targetAge: 67,
    category: "retirement",
    icon: "clock",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Required Minimum Distributions",
    description: "Must begin taking RMDs from retirement accounts",
    targetAge: 73,
    category: "financial",
    icon: "dollar-sign",
    isActive: true,
    sortOrder: 1,
  },
];

async function populateStandardMilestones() {
  try {
    console.log("Populating standard milestones...");
    
    // Insert the milestones
    const result = await db.insert(standardMilestones).values(defaultStandardMilestones);
    
    console.log(`✅ Successfully inserted ${defaultStandardMilestones.length} standard milestones`);
    
    // Fetch and display the inserted milestones
    const insertedMilestones = await db.select().from(standardMilestones);
    console.log("\nInserted milestones:");
    insertedMilestones.forEach(milestone => {
      console.log(`- Age ${milestone.targetAge}: ${milestone.title} (${milestone.category})`);
    });
    
  } catch (error) {
    console.error("❌ Error populating standard milestones:", error);
    process.exit(1);
  }
}

// Run the script
populateStandardMilestones();
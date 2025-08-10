#!/usr/bin/env tsx

import { storage } from "../server/db.js";

async function checkUsers() {
  console.log("🔍 Checking existing users...");

  try {
    // Try to get users by ID (starting from 1)
    for (let id = 1; id <= 5; id++) {
      try {
        const user = await storage.getUser(id);
        if (user) {
          console.log(`✅ Found user ID ${id}: ${user.username} (${user.firstName} ${user.lastName})`);
          
          // Check if this user has any retirement plans
          const plans = await storage.getRetirementPlans(id);
          console.log(`   📊 Retirement plans: ${plans.length}`);
          
          if (plans.length > 0) {
            for (const plan of plans) {
              console.log(`      - ${plan.planName} (${plan.planType})`);
              const snapshots = await storage.getAnnualSnapshots(plan.id);
              console.log(`        📈 Annual snapshots: ${snapshots.length}`);
            }
          }
        }
      } catch (error) {
        // User doesn't exist, continue
      }
    }
    
    console.log("\n🎯 Summary:");
    console.log("If no users were found, you'll need to:");
    console.log("1. Create a user account by visiting the app and signing up");
    console.log("2. Then run the seeding script to create dummy retirement plan data");

  } catch (error) {
    console.error("❌ Error checking users:", error);
  }
}

checkUsers()
  .then(() => {
    console.log("✨ User check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 User check failed:", error);
    process.exit(1);
  });
#!/usr/bin/env tsx

import dotenv from 'dotenv';

// Load environment variables BEFORE importing anything else
dotenv.config();

// Set environment variable explicitly if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://jose:@localhost:5432/retirement_planner";
}

// Now import storage after environment is set
import { storage } from "../server/db.js";
import type { 
  InsertRetirementPlan, 
  InsertAnnualSnapshot, 
  InsertAccountBalance, 
  InsertMilestone,
  InsertLiability 
} from "../shared/schema.js";

async function seedRetirementData() {
  console.log("🌱 Seeding retirement plan data...");
  
  // Debug: Check database URL
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const url = new URL(dbUrl);
    console.log(`🔗 Connecting to database: ${url.pathname.slice(1)} on ${url.hostname}:${url.port || 5432}`);
  } else {
    console.log("⚠️  No DATABASE_URL found in environment");
  }

  try {
    // First, try to find existing users
    let firstUser = await storage.getUser(1);
    
    if (!firstUser) {
      console.log("👤 No users found. Creating a demo user...");
      
      // Create a demo user
      const demoUserData = {
        username: "demo_user",
        password: "$2b$10$K7L1OqXqXc7K5A1cY2b4.O8Qz7J2K8L3P9Q1R5S6T7U8V9W0X1Y2Z3", // hashed "demo123"
        firstName: "Demo",
        lastName: "User",
        email: "demo@example.com",
        currentAge: 30,
        targetRetirementAge: 65,
        currentLocation: "San Francisco, CA",
        maritalStatus: "single",
        dependents: 0,
        currentIncome: "85000",
        expectedFutureIncome: "120000",
        desiredLifestyle: "comfortable",
        hasSpouse: false,
        totalMonthlyExpenses: "4500"
      };
      
      try {
        firstUser = await storage.createUser(demoUserData);
        console.log(`✅ Created demo user: ${firstUser.username} (ID: ${firstUser.id})`);
      } catch (userError) {
        console.log("⚠️  Demo user might already exist, trying to find it...");
        firstUser = await storage.getUserByUsername("demo_user");
        if (!firstUser) {
          throw new Error("Could not create or find demo user");
        }
      }
    }

    console.log(`📊 Creating retirement plan for user: ${firstUser.username} (ID: ${firstUser.id})`);

    // Create a comprehensive retirement plan
    const planData: InsertRetirementPlan = {
      userId: firstUser.id,
      planName: "My Retirement Plan",
      planType: "comprehensive",
      startAge: 30,
      retirementAge: 65,
      endAge: 95,
      initialNetWorth: "250000",
      totalLifetimeTax: "850000",
      isActive: true
    };

    const plan = await storage.createRetirementPlan(planData);
    console.log(`✅ Created retirement plan with ID: ${plan.id}`);

    // Create standard milestones
    const standardMilestones: InsertMilestone[] = [
      {
        planId: null,
        userId: null,
        milestoneType: "standard",
        title: "Full Retirement Age",
        description: "Eligible for full Social Security benefits",
        targetYear: null,
        targetAge: 67,
        category: "retirement",
        color: "#3b82f6",
        icon: "clock"
      },
      {
        planId: null,
        userId: null,
        milestoneType: "standard", 
        title: "Medicare Eligibility",
        description: "Eligible for Medicare benefits",
        targetYear: null,
        targetAge: 65,
        category: "healthcare",
        color: "#ef4444",
        icon: "shield"
      },
      {
        planId: null,
        userId: null,
        milestoneType: "standard",
        title: "Early Retirement",
        description: "Eligible for reduced Social Security benefits",
        targetYear: null,
        targetAge: 62,
        category: "retirement",
        color: "#10b981",
        icon: "clock"
      },
      {
        planId: null,
        userId: null,
        milestoneType: "standard",
        title: "Required Minimum Distributions",
        description: "Must begin taking RMDs from retirement accounts",
        targetYear: null,
        targetAge: 73,
        category: "financial",
        color: "#f59e0b",
        icon: "dollar-sign"
      }
    ];

    // Create personal milestones
    const personalMilestones: InsertMilestone[] = [
      {
        planId: plan.id,
        userId: firstUser.id,
        milestoneType: "personal",
        title: "Pay Off Mortgage",
        description: "Complete mortgage payments",
        targetYear: 2040,
        targetAge: 50,
        category: "housing",
        color: "#8b5cf6",
        icon: "home"
      },
      {
        planId: plan.id,
        userId: firstUser.id,
        milestoneType: "personal",
        title: "Kids' College Fund Complete",
        description: "Finish funding children's college education",
        targetYear: 2045,
        targetAge: 55,
        category: "education",
        color: "#06b6d4",
        icon: "graduation-cap"
      },
      {
        planId: plan.id,
        userId: firstUser.id,
        milestoneType: "personal",
        title: "Dream Vacation",
        description: "European river cruise",
        targetYear: 2050,
        targetAge: 60,
        category: "travel",
        color: "#ec4899",
        icon: "plane"
      }
    ];

    // Insert all milestones
    for (const milestone of [...standardMilestones, ...personalMilestones]) {
      await storage.createMilestone(milestone);
    }
    console.log(`✅ Created ${standardMilestones.length + personalMilestones.length} milestones`);

    // Generate annual snapshots (65 years from age 30 to 95)
    const currentYear = new Date().getFullYear();
    let netWorth = 250000; // Starting net worth
    let cumulativeTax = 0;
    
    console.log("📈 Generating annual snapshots...");
    
    for (let age = 30; age <= 95; age++) {
      const year = currentYear + (age - 30);
      const isWorking = age < 65;
      const isRetired = age >= 65;
      
      // Calculate income
      let grossIncome = 0;
      let netIncome = 0;
      if (isWorking) {
        grossIncome = 85000 + (age - 30) * 2000; // Growing salary
        netIncome = grossIncome * 0.75; // After taxes and deductions
      } else {
        grossIncome = 55000; // Retirement income from investments and SS
        netIncome = grossIncome * 0.85; // Lower tax rate in retirement
      }
      
      // Calculate expenses
      let totalExpenses = isRetired ? 45000 : 55000;
      
      // Calculate taxes
      const taxesPaid = grossIncome - netIncome;
      cumulativeTax += taxesPaid;
      
      // Calculate net worth growth
      const savings = netIncome - totalExpenses;
      const investmentReturn = netWorth * (isRetired ? 0.04 : 0.07); // Conservative growth in retirement
      netWorth += savings + investmentReturn;
      
      const totalAssets = netWorth + 25000; // Add some buffer for gross assets
      const totalLiabilities = age < 50 ? Math.max(0, 300000 - (age - 30) * 8000) : 0; // Mortgage paid off by 50
      
      const snapshotData: InsertAnnualSnapshot = {
        planId: plan.id,
        year,
        age,
        grossIncome: grossIncome.toString(),
        netIncome: netIncome.toString(),
        totalExpenses: totalExpenses.toString(),
        totalAssets: totalAssets.toString(),
        totalLiabilities: totalLiabilities.toString(),
        netWorth: (totalAssets - totalLiabilities).toString(),
        taxesPaid: taxesPaid.toString(),
        cumulativeTax: cumulativeTax.toString()
      };
      
      const snapshot = await storage.createAnnualSnapshot(snapshotData);
      
      // Create account balances for this snapshot
      const accountBalances: InsertAccountBalance[] = [
        {
          snapshotId: snapshot.id,
          accountType: "401k",
          accountName: "Company 401(k)",
          balance: (totalAssets * 0.35).toString(),
          contribution: isWorking ? "15000" : "0",
          withdrawal: isRetired ? "20000" : "0",
          growth: (totalAssets * 0.35 * (isRetired ? 0.04 : 0.07)).toString()
        },
        {
          snapshotId: snapshot.id,
          accountType: "traditional_ira",
          accountName: "Traditional IRA",
          balance: (totalAssets * 0.20).toString(),
          contribution: isWorking ? "6000" : "0",
          withdrawal: isRetired ? "8000" : "0",
          growth: (totalAssets * 0.20 * (isRetired ? 0.04 : 0.07)).toString()
        },
        {
          snapshotId: snapshot.id,
          accountType: "roth_ira",
          accountName: "Roth IRA",
          balance: (totalAssets * 0.25).toString(),
          contribution: isWorking ? "6000" : "0",
          withdrawal: "0",
          growth: (totalAssets * 0.25 * (isRetired ? 0.04 : 0.07)).toString()
        },
        {
          snapshotId: snapshot.id,
          accountType: "brokerage",
          accountName: "Taxable Brokerage",
          balance: (totalAssets * 0.15).toString(),
          contribution: isWorking ? "5000" : "0",
          withdrawal: isRetired ? "12000" : "0",
          growth: (totalAssets * 0.15 * (isRetired ? 0.04 : 0.07)).toString()
        },
        {
          snapshotId: snapshot.id,
          accountType: "savings",
          accountName: "High Yield Savings",
          balance: (totalAssets * 0.04).toString(),
          contribution: "2000",
          withdrawal: "1000",
          growth: (totalAssets * 0.04 * 0.02).toString()
        },
        {
          snapshotId: snapshot.id,
          accountType: "checking",
          accountName: "Primary Checking",
          balance: (totalAssets * 0.01).toString(),
          contribution: "0",
          withdrawal: "0",
          growth: "0"
        }
      ];
      
      for (const balance of accountBalances) {
        await storage.createAccountBalance(balance);
      }
      
      // Create liabilities for working years
      if (totalLiabilities > 0) {
        const liabilityData: InsertLiability = {
          snapshotId: snapshot.id,
          liabilityType: "mortgage",
          liabilityName: "Primary Residence Mortgage",
          balance: totalLiabilities.toString(),
          interestRate: "3.5",
          monthlyPayment: "2200"
        };
        
        await storage.createLiability(liabilityData);
      }
    }
    
    // Update the plan with the calculated total lifetime tax
    await storage.updateRetirementPlan(plan.id, {
      totalLifetimeTax: cumulativeTax.toString()
    });
    
    console.log(`✅ Generated ${95 - 30 + 1} annual snapshots with account balances`);
    console.log(`💰 Total lifetime tax calculated: $${cumulativeTax.toLocaleString()}`);
    console.log("🎉 Retirement plan data seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding retirement data:", error);
    throw error;
  }
}

// Run the seeding function
seedRetirementData()
  .then(() => {
    console.log("✨ Seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });

export { seedRetirementData };
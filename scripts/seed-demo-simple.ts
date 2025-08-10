import { storage } from "../server/db.js";
import bcrypt from "bcrypt";

export async function seedRetirementData() {
  console.log("🌱 Creating demo retirement data...");

  try {
    // First create or find a demo user
    let demoUser;
    try {
      demoUser = await storage.getUserByUsername("demo_user");
    } catch (e) {
      // User doesn't exist, create one
    }

    if (!demoUser) {
      console.log("👤 Creating demo user...");
      const hashedPassword = await bcrypt.hash("demo123", 10);
      
      demoUser = await storage.createUser({
        username: "demo_user",
        password: hashedPassword,
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
      });
      console.log(`✅ Created demo user: ${demoUser.username}`);
    } else {
      console.log(`✅ Found existing demo user: ${demoUser.username}`);
    }

    // Check if plan already exists
    const existingPlans = await storage.getRetirementPlans(demoUser.id);
    if (existingPlans.length > 0) {
      console.log(`✅ Demo user already has ${existingPlans.length} retirement plans`);
      return { message: "Demo data already exists", plans: existingPlans };
    }

    // Create retirement plan
    const plan = await storage.createRetirementPlan({
      userId: demoUser.id,
      planName: "My Comprehensive Retirement Plan",
      planType: "comprehensive", 
      startAge: 30,
      retirementAge: 65,
      endAge: 95,
      initialNetWorth: "250000",
      totalLifetimeTax: "0", // Will be calculated
      isActive: true
    });

    console.log(`✅ Created retirement plan: ${plan.id}`);

    // Create a few sample snapshots to test the UI
    const currentYear = new Date().getFullYear();
    const sampleYears = [30, 40, 50, 65, 75, 85, 95]; // Sample ages
    let cumulativeTax = 0;

    for (const age of sampleYears) {
      const year = currentYear + (age - 30);
      const isRetired = age >= 65;
      
      // Simple projection logic
      const grossIncome = isRetired ? 60000 : 85000 + (age - 30) * 1500;
      const netIncome = grossIncome * (isRetired ? 0.88 : 0.75);
      const expenses = isRetired ? 48000 : 58000;
      const taxesPaid = grossIncome - netIncome;
      cumulativeTax += taxesPaid;
      
      const netWorth = 250000 + (age - 30) * 35000 + (isRetired ? (age - 65) * 15000 : 0);
      const totalAssets = netWorth + (age < 50 ? 200000 : 0); // Mortgage paid off at 50
      const totalLiabilities = age < 50 ? Math.max(0, 250000 - (age - 30) * 8000) : 0;

      const snapshot = await storage.createAnnualSnapshot({
        planId: plan.id,
        year,
        age,
        grossIncome: grossIncome.toString(),
        netIncome: netIncome.toString(), 
        totalExpenses: expenses.toString(),
        totalAssets: totalAssets.toString(),
        totalLiabilities: totalLiabilities.toString(),
        netWorth: (totalAssets - totalLiabilities).toString(),
        taxesPaid: taxesPaid.toString(),
        cumulativeTax: cumulativeTax.toString()
      });

      // Create sample account balances
      await storage.createAccountBalance({
        snapshotId: snapshot.id,
        accountType: "401k",
        accountName: "Company 401(k)",
        balance: (totalAssets * 0.35).toString(),
        contribution: isRetired ? "0" : "15000",
        withdrawal: isRetired ? "20000" : "0", 
        growth: (totalAssets * 0.35 * 0.06).toString()
      });

      await storage.createAccountBalance({
        snapshotId: snapshot.id,
        accountType: "roth_ira", 
        accountName: "Roth IRA",
        balance: (totalAssets * 0.25).toString(),
        contribution: isRetired ? "0" : "6000",
        withdrawal: "0",
        growth: (totalAssets * 0.25 * 0.06).toString()
      });

      await storage.createAccountBalance({
        snapshotId: snapshot.id,
        accountType: "brokerage",
        accountName: "Taxable Brokerage", 
        balance: (totalAssets * 0.20).toString(),
        contribution: isRetired ? "0" : "8000",
        withdrawal: isRetired ? "15000" : "0",
        growth: (totalAssets * 0.20 * 0.06).toString()
      });

      await storage.createAccountBalance({
        snapshotId: snapshot.id,
        accountType: "savings",
        accountName: "Emergency Fund",
        balance: (totalAssets * 0.15).toString(),
        contribution: "3000",
        withdrawal: "1000", 
        growth: (totalAssets * 0.15 * 0.02).toString()
      });

      await storage.createAccountBalance({
        snapshotId: snapshot.id,
        accountType: "checking",
        accountName: "Primary Checking",
        balance: (totalAssets * 0.05).toString(),
        contribution: "0",
        withdrawal: "0",
        growth: "0"
      });

      // Add mortgage liability for working years
      if (totalLiabilities > 0) {
        await storage.createLiability({
          snapshotId: snapshot.id,
          liabilityType: "mortgage",
          liabilityName: "Home Mortgage", 
          balance: totalLiabilities.toString(),
          interestRate: "3.25",
          monthlyPayment: "2100"
        });
      }
    }

    // Create milestones
    await storage.createMilestone({
      planId: plan.id,
      userId: demoUser.id,
      milestoneType: "personal",
      title: "Mortgage Payoff",
      description: "Complete mortgage payments",
      targetYear: currentYear + 20,
      targetAge: 50,
      category: "housing",
      color: "#8b5cf6",
      icon: "home"
    });

    await storage.createMilestone({
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
    });

    // Update plan with total tax
    await storage.updateRetirementPlan(plan.id, {
      totalLifetimeTax: cumulativeTax.toString()
    });

    console.log(`✅ Created ${sampleYears.length} snapshots with account data`);
    console.log(`✅ Total lifetime tax: $${cumulativeTax.toLocaleString()}`);

    return { 
      message: "Demo data created successfully!", 
      user: demoUser,
      plan: plan,
      snapshots: sampleYears.length
    };

  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
}
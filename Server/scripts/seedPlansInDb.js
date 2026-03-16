const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

const Plan = require("../src/models/planModel");
const PLANS_STATIC = require("../src/config/plans");
const { PLANS: MODULE_PLANS } = require("../src/config/modules");

const seedPlans = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database.");

    // Delete existing plans to avoid duplicates in this seed-style migration
    // In a real production migration, you might use 'upsert' instead.
    await Plan.deleteMany({});
    console.log("Existing plans cleared.");

    const plansToInsert = [];

    // Keys in PLANS_STATIC are 'basic', 'professional', 'enterprise'
    // Keys in MODULE_PLANS are 'BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'
    
    const planKeys = ['basic', 'professional', 'enterprise'];

    for (const key of planKeys) {
      const staticData = PLANS_STATIC[key];
      const moduleData = MODULE_PLANS[key.toUpperCase()];

      if (!staticData || !moduleData) {
        console.warn(`Skipping key ${key}: data missing in one of the configs.`);
        continue;
      }

      plansToInsert.push({
        planId: staticData.id,
        name: staticData.name,
        description: staticData.description,
        priceMonthlyPaise: staticData.priceMonthlyPaise,
        priceYearlyPaise: staticData.priceYearlyPaise,
        razorpayPlanIdMonthly: staticData.razorpayPlanIdMonthly,
        razorpayPlanIdYearly: staticData.razorpayPlanIdYearly,
        maxUsers: staticData.maxUsers,
        maxStorage: staticData.maxStorage,
        enabledModules: moduleData.enabledModules,
        features: staticData.features,
        color: staticData.color,
        highlighted: staticData.highlighted || false,
        isActive: true
      });
    }

    // Add Custom Plan from MODULE_PLANS
    if (MODULE_PLANS.CUSTOM) {
      const custom = MODULE_PLANS.CUSTOM;
      plansToInsert.push({
        planId: custom.id,
        name: custom.name,
        description: custom.description,
        priceMonthlyPaise: 0,
        priceYearlyPaise: 0,
        maxUsers: 0, 
        maxStorage: 0,
        enabledModules: custom.enabledModules || [],
        features: ["Custom pricing", "Tailored resources"],
        color: "#6b7280",
        isActive: true
      });
    }

    await Plan.insertMany(plansToInsert);
    console.log(`Successfully seeded ${plansToInsert.length} plans into the database.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();

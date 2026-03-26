/**
 * Migration: Remove isPremium Field from User Model
 *
 * This migration:
 * 1. Validates all users' isPremium status against their actual subscriptions
 * 2. Fixes any inconsistencies found
 * 3. Reports statistics
 *
 * Run before deploying updated User model:
 * node migrations/remove-isPremium-field.js
 *
 * This is a SAFE migration - it only updates data, doesn't drop the field yet.
 * After confirming everything works, you can manually drop the field in MongoDB:
 * db.users.updateMany({}, { $unset: { isPremium: "" } })
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { Subscription } = require("../models/Subscription");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

const migrateIsPremium = async () => {
  console.log("\n🔄 Starting isPremium migration...\n");

  try {
    const users = await User.find({}).select("_id email isPremium");
    console.log(`📊 Found ${users.length} users to process\n`);

    let consistent = 0;
    let fixed = 0;
    let errors = 0;
    const inconsistencies = [];

    for (const user of users) {
      try {
        // Check actual subscription status
        const hasActive = await Subscription.hasActiveSubscription(user._id);
        const currentIsPremium = user.isPremium || false;

        if (currentIsPremium !== hasActive) {
          // Inconsistency found - fix it
          await User.findByIdAndUpdate(user._id, { isPremium: hasActive });
          fixed++;

          inconsistencies.push({
            email: user.email,
            before: currentIsPremium,
            after: hasActive,
            reason: hasActive
              ? "Has active subscription but isPremium was false"
              : "No active subscription but isPremium was true",
          });

          console.log(
            `🔧 Fixed ${user.email}: ${currentIsPremium} → ${hasActive}`,
          );
        } else {
          consistent++;
        }
      } catch (err) {
        errors++;
        console.error(`❌ Error processing ${user.email}:`, err.message);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📈 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total users:           ${users.length}`);
    console.log(`Already consistent:    ${consistent} ✅`);
    console.log(`Fixed:                 ${fixed} 🔧`);
    console.log(`Errors:                ${errors} ❌`);
    console.log("=".repeat(60) + "\n");

    if (inconsistencies.length > 0) {
      console.log("⚠️  INCONSISTENCIES FOUND AND FIXED:\n");
      inconsistencies.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.email}`);
        console.log(`   Before: ${item.before} | After: ${item.after}`);
        console.log(`   Reason: ${item.reason}\n`);
      });
    }

    if (errors === 0 && fixed >= 0) {
      console.log("✅ Migration completed successfully!");
      console.log(
        "\n💡 Next steps:\n   1. Deploy updated User model (without isPremium field)\n   2. Monitor application for 24 hours\n   3. If all good, manually drop isPremium field from MongoDB:\n      db.users.updateMany({}, { $unset: { isPremium: '' } })\n",
      );
    } else {
      console.log("⚠️  Migration completed with errors. Please review.");
    }
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDb();
  await migrateIsPremium();
  await mongoose.connection.close();
  console.log("\n🔌 Database connection closed");
  process.exit(0);
};

run();

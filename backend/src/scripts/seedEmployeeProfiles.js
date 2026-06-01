const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const EmployeeProfile = require("../models/EmployeeProfile");

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const workers = await User.find({ role: "worker" }).select("_id");

  let created = 0;
  for (const w of workers) {
    const exists = await EmployeeProfile.findOne({ userId: w._id });
    if (!exists) {
      await EmployeeProfile.create({ userId: w._id });
      created++;
    }
  }

  console.log("✅ Seed done. Created profiles:", created);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

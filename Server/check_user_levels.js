require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/userModel");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({})
    .select("name email level tenantId")
    .limit(20);
  console.log("User Levels:");
  users.forEach((u) => {
    console.log(
      `${u.name} (${u.email}): level=${u.level}, tenantId=${u.tenantId}`,
    );
  });
  await mongoose.disconnect();
})();

require("dotenv").config();
console.log("URL:", process.env.MONGO_URI ? "Found" : "Missing");
const mongoose = require("mongoose");
console.log("Mongoose loaded");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });

require("dotenv").config();
const mongoose = require("mongoose");
const Ward = require("../src/models/wardModel"); // Assuming model exists or we create it.
// Checking file list earlier, "wardModel.js" did NOT exist.
// If it doesn't exist, I cannot seed it.
// However, the user added "WARD" to modules.
// I should create wardModel.js first if missing.
// I'll check directory again to be absolutely sure.

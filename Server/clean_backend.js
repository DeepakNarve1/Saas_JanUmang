const fs = require("fs");
const path = require("path");

const tenantControllerPath = path.join(
  process.cwd(),
  "src",
  "controller",
  "tenantController.js",
);
let content = fs.readFileSync(tenantControllerPath, "utf8");

// Remove logs wrapped in development check if they are purely debug
content = content.replace(
  /if\s*\(process\.env\.NODE_ENV\s*!==\s*["']production["']\)\s*\{\s*console\.log\(.*?\);\s*\}/gs,
  "",
);

// Also remove simple ones
content = content.replace(/^\s*console\.log\(.*?\);?\s*$/gm, "");

fs.writeFileSync(tenantControllerPath, content, "utf8");
console.log("Cleaned tenantController.js");

// Clean subscriptionCron.js
const cronPath = path.join(
  process.cwd(),
  "src",
  "services",
  "subscriptionCron.js",
);
let cronContent = fs.readFileSync(cronPath, "utf8");
// Remove the start/tick logs
cronContent = cronContent.replace(
  /^\s*console\.log\("\[CRON\] Running.*?"\);?\s*$/gm,
  "",
);
fs.writeFileSync(cronPath, cronContent, "utf8");
console.log("Cleaned subscriptionCron.js");

const fs = require("fs");
const path = require("path");

const menuPath = path.join(__dirname, "src", "utils", "menu.ts");
let menuContent = fs.readFileSync(menuPath, "utf8");

const regex = /path:\s*"(.*?)"/g;
let match;
let missingPaths = [];

while ((match = regex.exec(menuContent)) !== null) {
  const p = match[1];
  const appPath = path.join(
    __dirname,
    "src",
    "app",
    "(protected)",
    p,
    "page.tsx",
  );
  if (!fs.existsSync(appPath)) {
    missingPaths.push(p);
  }
}

console.log("Missing Paths:", missingPaths);

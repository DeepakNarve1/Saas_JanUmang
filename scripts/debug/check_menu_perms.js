const fs = require("fs");

const MODULES_PATH =
  "d:\\Akalp\\Saas\\JanUmangSaas\\Server\\src\\config\\modules.js";
const MODULES_CONTENT = fs.readFileSync(MODULES_PATH, "utf8");

const MENU_PATH =
  "d:\\Akalp\\Saas\\JanUmangSaas\\adminlte-3-react-main\\src\\utils\\menu.ts";
const MENU_CONTENT = fs.readFileSync(MENU_PATH, "utf8");

const allPerms = new Set();
const regex = /"([a-z_]+)"/g;
let match;
while ((match = regex.exec(MODULES_CONTENT)) !== null) {
  if (match[1].includes("_")) allPerms.add(match[1]);
}

const menuPermsRegex = /allowedPermissions: \[([^\]]+)\]/g;
const menuMismatches = [];

while ((match = menuPermsRegex.exec(MENU_CONTENT)) !== null) {
  const perms = match[1].split(",").map((p) => p.trim().replace(/['"]/g, ""));
  perms.forEach((p) => {
    if (!allPerms.has(p)) {
      menuMismatches.push(p);
    }
  });
}

console.log("Menu Permission Mismatches:", [...new Set(menuMismatches)]);

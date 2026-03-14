const fs = require("fs");
const path = require("path");

const permsPath = path.join(
  "d:",
  "Akalp",
  "Saas",
  "JanUmangSaas",
  "shared",
  "permissions.json",
);
const perms = JSON.parse(fs.readFileSync(permsPath, "utf8"));

const modulesPath = path.join(
  "d:",
  "Akalp",
  "Saas",
  "JanUmangSaas",
  "Server",
  "src",
  "config",
  "modules.js",
);
let modulesContent = fs.readFileSync(modulesPath, "utf8");

// replace the string literals with PERMISSIONS.<KEY> if found.
if (!modulesContent.includes("const PERMISSIONS = require")) {
  modulesContent =
    "const PERMISSIONS = require('../../../shared/permissions.json');\n" +
    modulesContent;
}

for (const [key, val] of Object.entries(perms)) {
  modulesContent = modulesContent.replace(
    new RegExp('"' + val + '"', "g"),
    "PERMISSIONS." + key,
  );
}

fs.writeFileSync(modulesPath, modulesContent);
console.log("modules.js updated");

const menuPath = path.join(
  "d:",
  "Akalp",
  "Saas",
  "JanUmangSaas",
  "adminlte-3-react-main",
  "src",
  "utils",
  "menu.ts",
);
let menuContent = fs.readFileSync(menuPath, "utf8");

if (!menuContent.includes("PERMISSIONS } from '@app/config/permissions'")) {
  menuContent =
    "import { PERMISSIONS } from '@app/config/permissions';\n" + menuContent;
}

for (const [key, val] of Object.entries(perms)) {
  menuContent = menuContent.replace(
    new RegExp('"' + val + '"', "g"),
    "PERMISSIONS." + key,
  );
}

fs.writeFileSync(menuPath, menuContent);
console.log("menu.ts updated");

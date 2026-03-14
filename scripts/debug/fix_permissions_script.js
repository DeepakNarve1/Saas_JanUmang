const fs = require("fs");
const path = require("path");

const perms = JSON.parse(fs.readFileSync("shared/permissions.json", "utf8"));

// 1. Process modules.js
let modulesPath = "Server/src/config/modules.js";
let mContent = fs.readFileSync(modulesPath, "utf8");

if (!mContent.includes("const PERMISSIONS")) {
  mContent =
    "const PERMISSIONS = require('../../../shared/permissions.json');\n" +
    mContent;
}

for (const [key, val] of Object.entries(perms)) {
  const rs = '\"' + val + '\"';
  mContent = mContent.split(rs).join("PERMISSIONS." + key);
}

fs.writeFileSync("modules_fixed.js", mContent);
console.log("Saved modules_fixed.js");

// 2. Process menu.ts
let menuPath = "adminlte-3-react-main/src/utils/menu.ts";
let menuContent = fs.readFileSync(menuPath, "utf8");

if (!menuContent.includes("PERMISSIONS } from '@app/config/permissions'")) {
  menuContent =
    "import { PERMISSIONS } from '@app/config/permissions';\n" + menuContent;
}

for (const [key, val] of Object.entries(perms)) {
  const rs = '\"' + val + '\"';
  menuContent = menuContent.split(rs).join("PERMISSIONS." + key);
}
fs.writeFileSync("menu_fixed.ts", menuContent);
console.log("Saved menu_fixed.ts");

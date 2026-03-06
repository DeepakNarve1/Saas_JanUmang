const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// The shared permissions definitions
const permsPath = path.join(
  "d:",
  "Akalp",
  "Saas",
  "JanUmangSaas",
  "shared",
  "permissions.json",
);
const permsData = JSON.parse(fs.readFileSync(permsPath, "utf8"));

// Reverse mapping from string -> PERMISSIONS.KEY
const permMap = {};
for (const [key, val] of Object.entries(permsData)) {
  permMap[val] = `PERMISSIONS.${key}`;
}

const targetDirSrc = path.join(
  "d:",
  "Akalp",
  "Saas",
  "JanUmangSaas",
  "adminlte-3-react-main",
  "src",
);

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const allTsxFiles = getAllFiles(targetDirSrc);

let updatedFiles = 0;

for (const file of allTsxFiles) {
  let content = fs.readFileSync(file, "utf8");
  let hasChanges = false;

  // Check if RouteGuard or hasPermission is being used and it contains a literal we can map
  for (const [strVal, constName] of Object.entries(permMap)) {
    // Find requiredPermissions={["..."]}
    const reqPermsRegex1 = new RegExp(
      `requiredPermissions=\\{\\s*\\[\\s*(["'])${strVal}\\1\\s*\\]\\s*\\}`,
      "g",
    );
    if (reqPermsRegex1.test(content)) {
      content = content.replace(
        reqPermsRegex1,
        `requiredPermissions={[${constName}]}`,
      );
      hasChanges = true;
    }

    // Find requiredPermissions={["...","..."]}
    const reqPermsRegex2 = new RegExp(`(["'])${strVal}\\1`, "g");
    // Let's just blindly replace the strings inside requiredPermissions if they exist:
    // Well, a safer way is just replacing the string if RouteGuard is in the file.
    // But some components might have multiple string arrays.
  }

  // Safer replacement:
  // We will do a generic replacement for all hardcoded strings that match a permission
  // INSIDE `requiredPermissions={[` and `]}` OR `requiredPermission="xxx"`

  // Process exact `requiredPermission="xxx"`
  for (const [strVal, constName] of Object.entries(permMap)) {
    const reqPermStrReg = new RegExp(
      `requiredPermission=(["'])${strVal}\\1`,
      "g",
    );
    if (reqPermStrReg.test(content)) {
      content = content.replace(
        reqPermStrReg,
        `requiredPermissions={[${constName}]}`,
      );
      hasChanges = true;
    }

    // Also requiredPermission={'xxx'}
    const reqPermStrReg2 = new RegExp(
      `requiredPermission=\\{(["'])${strVal}\\1\\}`,
      "g",
    );
    if (reqPermStrReg2.test(content)) {
      content = content.replace(
        reqPermStrReg2,
        `requiredPermissions={[${constName}]}`,
      );
      hasChanges = true;
    }

    // Inside requiredPermissions={["...","..."]}
    // A bit tricky with regex, but we can replace any `"strVal"` or `'strVal'`
    // IF it's in a RouteGuard tag or an array mapped to it.
    // Actually we can just regex replace all occurrences of `"strVal"` that look like permissions strings.
    // "view_party" -> PERMISSIONS.VIEW_PARTY
    // Only if it's inside an array `[\"manage_roles\", \"create_users\"]`
    const arrStrRegex = new RegExp(`(["'])${strVal}\\1`, "g");

    // Check if there is <RouteGuard in the file
    if (content.includes("RouteGuard")) {
      // Let's replace the string if it's within `requiredPermissions={[` `]}`
      let parts = content.split("requiredPermissions={[");
      for (let i = 1; i < parts.length; i++) {
        let endIdx = parts[i].indexOf("]}");
        if (endIdx !== -1) {
          let innerArray = parts[i].substring(0, endIdx);
          if (
            innerArray.includes(`"${strVal}"`) ||
            innerArray.includes(`'${strVal}'`)
          ) {
            let newInner = innerArray.replace(arrStrRegex, constName);
            parts[i] = newInner + parts[i].substring(endIdx);
            hasChanges = true;
          }
        }
      }
      content = parts.join("requiredPermissions={[");
    }
  }

  if (hasChanges) {
    // make sure import { PERMISSIONS } from "@app/config/permissions" exists
    if (
      !content.includes("import { PERMISSIONS }") &&
      !content.includes("import {PERMISSIONS}")
    ) {
      // Find where other imports are
      if (content.includes("import { RouteGuard }")) {
        content = content.replace(
          /import { RouteGuard } from ['"](.*)['"];?/,
          `import { RouteGuard } from '$1';\nimport { PERMISSIONS } from "@app/config/permissions";`,
        );
      } else if (content.includes("import ")) {
        // insert after first import
        content = content.replace(
          /import (.*?)from ['"](.*?)['"];?\n/,
          `import $1from '$2';\nimport { PERMISSIONS } from "@app/config/permissions";\n`,
        );
      }
    }

    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated RouteGuards in: ${file}`);
    updatedFiles++;
  }
}

console.log("Total files updated:", updatedFiles);

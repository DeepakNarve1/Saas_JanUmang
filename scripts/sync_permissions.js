const fs = require("fs");
const path = require("path");

const modulesPath = path.join(__dirname, "../Server/src/config/modules.js");
const { MODULES } = require(modulesPath);

// Create a unified dictionary of permissions dynamically from the registry
const permissionsMap = {};

Object.values(MODULES).forEach((module) => {
  if (module.permissions) {
    module.permissions.forEach((permission) => {
      // Converts "view_mp_public_problems" to "VIEW_MP_PUBLIC_PROBLEMS"
      const constName = permission.toUpperCase();
      permissionsMap[constName] = permission;
    });
  }
});

// Paths to write
const sharedJsonPath = path.join(__dirname, "../shared/permissions.json");
const frontendTsPath = path.join(
  __dirname,
  "../adminlte-3-react-main/src/config/permissions.ts",
);
const backendJsonPath = path.join(
  __dirname,
  "../Server/src/config/permissions.json",
);

// Write JSON
const sharedDir = path.dirname(sharedJsonPath);
if (!fs.existsSync(sharedDir)) {
  fs.mkdirSync(sharedDir, { recursive: true });
}

const jsonContent = JSON.stringify(permissionsMap, null, 2);
fs.writeFileSync(sharedJsonPath, jsonContent);
fs.writeFileSync(backendJsonPath, jsonContent);

// Write TypeScript constants for the frontend (for best autocomplete)
const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// This file is generated from the backend's modules.js configuration
// To update permissions, update modules.js and run the sync script.

export const PERMISSIONS = ${jsonContent} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
`;

const frontendDir = path.dirname(frontendTsPath);
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

fs.writeFileSync(frontendTsPath, tsContent);

console.log(
  "✅ Permissions successfully synced across frontend and backend from modules.js!",
);

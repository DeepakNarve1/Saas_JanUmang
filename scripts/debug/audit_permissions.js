const fs = require("fs");
const path = require("path");

console.log("Starting Audit...");

// Mock a minimal version of the MODULES config
const MODULES_PATH =
  "d:\\Akalp\\Saas\\JanUmangSaas\\Server\\src\\config\\modules.js";
if (!fs.existsSync(MODULES_PATH)) {
  console.log("Error: MODULES_PATH not found:", MODULES_PATH);
  process.exit(1);
}
const MODULES_CONTENT = fs.readFileSync(MODULES_PATH, "utf8");
// Extract all permissions from the file
const allPermissionsRegex = /"([a-z_]+)"/g;
const allPermissions = new Set();
let match;
while ((match = allPermissionsRegex.exec(MODULES_CONTENT)) !== null) {
  if (match[1].includes("_")) {
    // Poor man's way to get permission-like strings
    allPermissions.add(match[1]);
  }
}

console.log(`Found ${allPermissions.size} permission names in config.`);

const protectedDir =
  "d:\\Akalp\\Saas\\JanUmangSaas\\adminlte-3-react-main\\src\\app\\(protected)";

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (file.endsWith("page.tsx")) {
        results.push(fullPath);
      }
    }
  });
  return results;
};

const pages = walk(protectedDir);
console.log(`Scanning ${pages.length} pages...`);
const mismatches = [];

pages.forEach((pagePath) => {
  const content = fs.readFileSync(pagePath, "utf8");
  // Match both requiredPermission and requiredPermissions
  const regex = /requiredPermission(?:s)?={?\[?["']([^"']+)["']/g;
  while ((match = regex.exec(content)) !== null) {
    const perm = match[1];
    if (!allPermissions.has(perm)) {
      // Special case: check if plural version exists
      const plural = perm + "s";
      if (allPermissions.has(plural)) {
        mismatches.push({ file: pagePath, found: perm, suggested: plural });
      } else {
        mismatches.push({
          file: pagePath,
          found: perm,
          suggested: "NOT_FOUND",
        });
      }
    }
  }
});

console.log("\n--- Permission Audit Results ---");
mismatches.forEach((m) => {
  console.log(`File: ${m.file}`);
  console.log(`  Found: ${m.found}`);
  console.log(`  Suggested: ${m.suggested}`);
});
console.log("--------------------------------");

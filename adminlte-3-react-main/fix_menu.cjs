const fs = require("fs");
const path = require("path");

const menuPath = path.join(__dirname, "src", "utils", "menu.ts");
let menuContent = fs.readFileSync(menuPath, "utf8");

// The replacement content for Assembly Issue
const newRef = `{
    name: "Assembly Issue",
    icon: "fas fa-university nav-icon",
    path: "/assembly-issue",
    resource: "assembly_issues",
    allowedPermissions: [PERMISSIONS.VIEW_ASSEMBLY_ISSUES],
  },`;

// We want to replace the whole `{ name: "Assembly Issue" ... }`
// The easiest way is via a simple regex or string split.
const startIndex = menuContent.indexOf("  {");
const splitByStr = 'name: "Assembly Issue",';
const parts = menuContent.split(splitByStr);

if (parts.length > 1) {
  const beforeObj = parts[0].lastIndexOf("  {");
  const contentBefore = menuContent.substring(0, beforeObj);

  // Find where the Assembly object ends.
  // It's followed by `{ name: "Vidhasabha Samiti" }`
  const vidhasabhaIndex = menuContent.indexOf('name: "Vidhasabha Samiti"');
  const afterObj = menuContent.substring(0, vidhasabhaIndex).lastIndexOf("  {");

  const contentAfter = menuContent.substring(afterObj);

  fs.writeFileSync(
    menuPath,
    contentBefore + "  " + newRef + "\n" + contentAfter,
    "utf8",
  );
  console.log("Updated menu.ts successfully!");
} else {
  console.log("Could not find Assembly Issue chunk");
}

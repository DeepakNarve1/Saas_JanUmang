const fs = require("fs");
const path = require("path");

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (
        name.endsWith(".tsx") ||
        name.endsWith(".ts") ||
        name.endsWith(".js")
      ) {
        files.push(name);
      }
    }
  }
  return files;
}

const srcDir = path.join(process.cwd(), "src");
const allFiles = getFiles(srcDir);

let count = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("console.log")) continue;

  // Pattern to match console.log(...) and handle multi-line but strictly if it looks like a debug log
  // This is a bit risky but we are in a "clean up" phase.
  // I will target logs that start with a string prefix, as these are usually debug logs.
  // Example: console.log("something", data)
  const regex = /^\s*console\.log\((['"`]).*?\1,.*?\);?\s*$/gm;
  // Also match single string logs: console.log("something");
  const regex2 = /^\s*console\.log\((['"`]).*?\1\);?\s*$/gm;

  // Actually, I'll be even simpler and just remove MOST console logs in views.
  if (file.includes("views")) {
    const original = content;
    content = content.replace(/^\s*console\.log\(.*?\);?\s*$/gm, "");
    if (original !== content) {
      fs.writeFileSync(file, content, "utf8");
      count++;
      console.log(`Cleaned: ${file}`);
    }
  }
}

console.log(`Processed ${count} frontend files.`);

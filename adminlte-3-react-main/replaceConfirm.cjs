const fs = require("fs");
const path = require("path");

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = dir + "/" + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

const allFiles = getFiles("src");

const tsxFiles = allFiles.filter(
  (f) => f.endsWith(".tsx") && !f.includes("worktype"),
);

const importRegex =
  /(import\s+\{([^}]+)\}\s+from\s+["']@app\/components\/ui\/dropdown-menu["'];)/g;
const insertImport = `\nimport { ConfirmDialog } from "@app/components/common/ConfirmDialog";\n`;

let count = 0;

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("window.confirm")) continue;

  console.log(`Processing ${file}...`);

  // 1. Remove window.confirm
  content = content.replace(
    /if\s*\(!window\.confirm\([^)]*\)\)\s*return;/g,
    "",
  );

  let modified = true;

  // 2. Add ConfirmDialog import if missing
  if (!content.includes("import { ConfirmDialog }")) {
    if (content.match(importRegex)) {
      content = content.replace(
        importRegex,
        (match) => `${match}${insertImport}`,
      );
    } else {
      // Just put it at the very top after the first import
      content = content.replace(/^(import .*?\n)/, `$1${insertImport}`);
    }
  }

  // 3. Replace <DropdownMenuItem>...Delete...</DropdownMenuItem> with ConfirmDialog
  const regex =
    /<DropdownMenuItem[^>]*onClick=\{\(\)\s*=>\s*handleDelete\(([^)]+)\)\}[^>]*>\s*<Trash2[^>]*\/>\s*(Delete)\s*<\/DropdownMenuItem>/g;

  content = content.replace(regex, (match, itemArg, text) => {
    return `<ConfirmDialog
                                    onConfirm={() => handleDelete(${itemArg})}
                                    trigger={
                                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> ${text}
                                      </div>
                                    }
                                  />`;
  });

  fs.writeFileSync(file, content, "utf8");
  count++;
}

console.log("Processed", count, "files.");

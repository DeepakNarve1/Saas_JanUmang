const { MODULES } = require("./src/config/modules.js");
console.log("Total Modules Defined: ", Object.keys(MODULES).length);
Object.keys(MODULES).forEach((key, index) => {
  console.log(`${index + 1}. ${key} (id: ${MODULES[key].id})`);
});
process.exit(0);

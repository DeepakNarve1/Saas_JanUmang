const { MODULES } = require("./src/config/modules.js");
Object.keys(MODULES).forEach((key) => {
  const mod = MODULES[key];
  console.log(`${key}: id=${mod.id}, alwaysEnabled=${mod.alwaysEnabled}`);
});

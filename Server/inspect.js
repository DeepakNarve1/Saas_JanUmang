const { MODULES } = require("./src/config/modules.js");
console.log(
  Object.keys(MODULES)
    .map((k) => MODULES[k].id)
    .join(", "),
);

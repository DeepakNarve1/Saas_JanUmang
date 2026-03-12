const { MODULES } = require("./src/config/modules.js");
const ids = Object.values(MODULES).map((m) => m.id);
const counts = {};
ids.forEach((id) => {
  counts[id] = (counts[id] || 0) + 1;
});
Object.keys(counts).forEach((id) => {
  if (counts[id] > 1) {
    console.log(`Duplicate ID: ${id} (count: ${counts[id]})`);
  }
});

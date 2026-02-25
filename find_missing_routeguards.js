const fs = require("fs");
const path = require("path");

const protectedDir =
  "d:\\Akalp\\Saas\\JanUmangSaas\\adminlte-3-react-main\\src\\app\\(protected)";

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith("page.tsx")) {
        results.push(file);
      }
    }
  });
  return results;
};

const pages = walk(protectedDir);
const pagesWithoutRouteGuard = [];

pages.forEach((pagePath) => {
  const content = fs.readFileSync(pagePath, "utf8");
  if (!content.includes("RouteGuard")) {
    pagesWithoutRouteGuard.push(pagePath);
  }
});

console.log("Pages without RouteGuard:");
pagesWithoutRouteGuard.forEach((p) => console.log(p));

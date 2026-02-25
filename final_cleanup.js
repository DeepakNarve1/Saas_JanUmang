const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const serverDir = path.join(rootDir, "Server");

const rootFilesToMove = [
  "assign_perm_all.js",
  "check_booth_data.js",
  "check_seashell.js",
  "check_seashell_v2.js",
  "check_seashell_v3.js",
  "check_user_perms.js",
  "compare_modules.js",
  "db_check.js",
  "debug_modules.js",
  "debug_seashell.js",
  "enable_user_count_all.js",
  "fixSeedPermissions.js",
  "fix_db_perms.js",
  "fix_seashell.js",
  "fix_seashell_log.js",
  "fix_seashell_v3.js",
  "force_seashell.js",
  "force_sync.js",
  "global_robust_sync.js",
  "list_modules.js",
  "list_perms.js",
  "print_modules.js",
  "quick_check.js",
  "reconcile_db.js",
  "verify_all_modules.js",
  "write_modules.js",
  "debug_modules.py",
];

const serverFilesToMove = [
  "checkBlocks.js",
  "checkBooths.js",
  "checkConn.js",
  "checkPanchayats.js",
  "checkTenantStatus.js",
  "cleanupTenantRoles.js",
  "debugBooth10.js",
  "diagnoseTenants.js",
  "fetchTenants.js",
  "fixSeashellCorp.js",
  "fixTenantStatus.js",
  "run_migration.bat",
  "seedAgarHierarchy.js",
  "seedAgarMalwaEverything.js",
  "seedAgarTestData.js",
  "seedAgarVoters.js",
  "seedAssemblyIssues.js",
  "seedAssemblyIssuesSmall.js",
  "seedBlocks.js",
  "seedBooths.js",
  "seedCallManagement.js",
  "seedData.js",
  "seedDispatchRegister.js",
  "seedEvents.js",
  "seedInDocs.js",
  "seedInwardRegister.js",
  "seedLowerHierarchy.js",
  "seedMasterData.js",
  "seedPanchayats.js",
  "seedPermissions.js",
  "seedPhoneDirectory.js",
  "seedPhoneDirectoryV2.js",
  "seedProjects.js",
  "seedPublicProblems.js",
  "seedSamitis.js",
  "seedSubTypeOfWork.js",
  "seedVidhanSabhaList.js",
  "seedVillages.js",
  "seedVisitors.js",
  "seedVoters.js",
  "seedVotersLoop.js",
  "seedWorktypes.js",
  "seed_visitors_v2.js",
  "seed_voters.js",
  "verifyAgarMalwa.js",
];

const filesToDelete = [
  "!seedModules.has(m))",
  "console.log(m.id",
  "m.id)",
  "m.id).join('",
  "{",
  "organize_files.js",
  "delete_junk.js",
];

function moveFile(srcDir, destDir, filename) {
  const srcPath = path.join(srcDir, filename);
  const destPath = path.join(destDir, filename);
  if (fs.existsSync(srcPath)) {
    try {
      // Overwrite if exists
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      fs.renameSync(srcPath, destPath);
      console.log(`Moved: ${filename}`);
    } catch (err) {
      console.error(`Failed to move ${filename}: ${err.message}`);
    }
  }
}

function removeFile(dir, filename) {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    try {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      console.log(`Deleted: ${filename}`);
    } catch (err) {
      console.error(`Failed to delete ${filename}: ${err.message}`);
    }
  }
}

console.log("Starting cleanup...");

// 1. Root Moves
const rootDest = path.join(rootDir, "maintenance_scripts");
rootFilesToMove.forEach((f) => moveFile(rootDir, rootDest, f));

// 2. Server Moves
const serverDest = path.join(serverDir, "scripts", "archive");
serverFilesToMove.forEach((f) => moveFile(serverDir, serverDest, f));

// 3. Deletions
filesToDelete.forEach((f) => removeFile(rootDir, f));

console.log("Cleanup finished.");

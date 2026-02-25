const express = require("express");
const {
  getPublicProblems,
  getPublicProblemById,
  createPublicProblem,
  updatePublicProblem,
  deletePublicProblem,
  seedPublicProblems,
} = require("../controller/publicProblemController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    checkModuleAccess("mp_public_problems"),
    checkPermission("view_mp_public_problems"),
    scopeQuery(),
    getPublicProblems,
  )
  .post(
    protect,
    checkModuleAccess("mp_public_problems"),
    checkPermission("create_mp_public_problems"),
    createPublicProblem,
  );

router
  .route("/seed")
  .post(
    protect,
    checkModuleAccess("mp_public_problems"),
    checkPermission("create_mp_public_problems"),
    seedPublicProblems,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("mp_public_problems"),
    checkPermission("view_mp_public_problems"),
    scopeQuery(),
    getPublicProblemById,
  )
  .put(
    protect,
    checkModuleAccess("mp_public_problems"),
    checkPermission("edit_mp_public_problems"),
    updatePublicProblem,
  )
  .delete(
    protect,
    checkModuleAccess("mp_public_problems"),
    checkPermission("delete_mp_public_problems"),
    deletePublicProblem,
  );

module.exports = router;

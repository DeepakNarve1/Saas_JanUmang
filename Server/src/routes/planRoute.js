const express = require("express");
const {
  getPlans,
  getAdminPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  syncPlanToRazorpay,
} = require("../controller/planController");
const protect = require("../middleware/authMiddleware");
const { isGlobalAdmin } = require("../utils/authHelpers");

const router = express.Router();

// Middleware to restrict to Global Admin
const globalAdminOnly = (req, res, next) => {
  if (isGlobalAdmin(req.user)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied: Global Administrator rights required",
  });
};

router.route("/").get(getPlans).post(protect, globalAdminOnly, createPlan);
router.route("/admin").get(protect, globalAdminOnly, getAdminPlans);

router.post("/:id/sync-razorpay", protect, globalAdminOnly, syncPlanToRazorpay);

router
  .route("/:id")
  .get(getPlanById)
  .put(protect, globalAdminOnly, updatePlan)
  .delete(protect, globalAdminOnly, deletePlan);

module.exports = router;

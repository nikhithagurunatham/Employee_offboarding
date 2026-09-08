import express from "express";

import {
  getOffboardingDashboard
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/offboarding/:offboardingId",
  getOffboardingDashboard
);

export default router;
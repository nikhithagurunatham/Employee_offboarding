import express from "express";

import {
  downloadResignationAcceptance,
  downloadNOC,
  downloadExperienceRelieving
} from "../controllers/documentController.js";

const router = express.Router();

router.get(
  "/:offboardingId/resignation-acceptance",
  downloadResignationAcceptance
);

router.get(
  "/:offboardingId/noc",
  downloadNOC
);

router.get(
  "/:offboardingId/experience-relieving",
  downloadExperienceRelieving
);

export default router;
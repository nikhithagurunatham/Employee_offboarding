import express from "express";

import {
  createAccessRevocation,
  getAccessRevocations,
  getAccessRevocationByOffboarding
} from "../controllers/accessRevocationController.js";

const router = express.Router();

router.post("/", createAccessRevocation);

router.get("/", getAccessRevocations);

router.get(
  "/offboarding/:offboardingId",
  getAccessRevocationByOffboarding
);

export default router;
import express from "express";

import {
    createOffboarding,
    getOffboardings,
    getOffboardingById
} from "../controllers/offboardingController.js";

const router = express.Router();

router.post("/", createOffboarding);

router.get("/", getOffboardings);

router.get("/:id", getOffboardingById);

export default router;
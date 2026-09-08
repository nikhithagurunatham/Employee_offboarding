import express from "express";

import {
    getAuditLogs,
    getAuditLogsByOffboarding
} from "../controllers/auditController.js";

const router = express.Router();

router.get("/", getAuditLogs);

router.get(
    "/offboarding/:offboardingId",
    getAuditLogsByOffboarding
);

export default router;
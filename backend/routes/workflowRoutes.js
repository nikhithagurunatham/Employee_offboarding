import express from "express";

import {
    createWorkflowTemplate,
    getWorkflowTemplates,
    getWorkflowTemplateById,
    processWorkflowStage,
    getWorkflowInstances
} from "../controllers/workflowController.js";

const router = express.Router();

router.post("/", createWorkflowTemplate);

router.get("/", getWorkflowTemplates);
router.get("/instances", getWorkflowInstances);

router.get("/:id", getWorkflowTemplateById);
router.patch(
    "/:workflowId/stages/:stageId",
    processWorkflowStage
);


export default router;
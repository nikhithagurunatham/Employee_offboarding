import WorkflowTemplate from "../models/WorkflowTemplate.js";
import { processStage } from "../services/workflowService.js";
import WorkflowInstance from "../models/WorkflowInstance.js";
// Create workflow template
export const createWorkflowTemplate = async (req, res) => {
    try {
        const { name, description, stages } = req.body;

        if (!name || !stages || stages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Workflow name and stages are required"
            });
        }

        const invalidStage = stages.find((stage) =>
            !stage.name ||
            !stage.role ||
            !Number.isInteger(stage.order) ||
            stage.order < 1 ||
            !["sequential", "parallel"].includes(stage.mode || "sequential")
        );

        if (invalidStage) {
            return res.status(400).json({
                success: false,
                message: "Each stage requires a name, role, positive integer order, and valid mode"
            });
        }

        const workflow = await WorkflowTemplate.create({
            name,
            description,
            stages
        });

        res.status(201).json({
            success: true,
            message: "Workflow template created successfully",
            data: workflow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all workflow templates
export const getWorkflowTemplates = async (req, res) => {
    try {
        const workflows = await WorkflowTemplate.find();

        res.status(200).json({
            success: true,
            count: workflows.length,
            data: workflows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get workflow template by ID
export const getWorkflowTemplateById = async (req, res) => {
    try {
        const workflow = await WorkflowTemplate.findById(req.params.id);

        if (!workflow) {
            return res.status(404).json({
                success: false,
                message: "Workflow template not found"
            });
        }

        res.status(200).json({
            success: true,
            data: workflow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};export const processWorkflowStage = async (req, res) => {
    try {
        const {
            action,
            approver,
            remarks,
            checklist
        } = req.body;

        const workflow = await processStage(
            req.params.workflowId,
            req.params.stageId,
            action,
            approver,
            remarks,
            checklist
        );

        res.status(200).json({
            success: true,
            message: `Stage ${action}d successfully`,
            data: workflow
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
export const getWorkflowInstances = async (req, res) => {
  try {
    const workflows = await WorkflowInstance.find()
      .populate("offboarding")
      .populate("template")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workflows.length,
      data: workflows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
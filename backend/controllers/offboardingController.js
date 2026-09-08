import Offboarding from "../models/Offboarding.js";
import { createWorkflowInstance } from "../services/workflowService.js";
// Create offboarding
export const createOffboarding = async (req, res) => {
    try {
        const {
            employee,
            resignationDate,
            lastWorkingDay,
            reason
        } = req.body;

        if (!employee || !resignationDate || !lastWorkingDay) {
            return res.status(400).json({
                success: false,
                message: "Employee, resignation date and last working day are required"
            });
        }

        // Create offboarding
        const offboarding = await Offboarding.create({
            employee,
            resignationDate,
            lastWorkingDay,
            reason
        });

        // Create workflow instance
        const workflow = await createWorkflowInstance(offboarding._id);

        const populatedOffboarding = await offboarding.populate("employee");

        res.status(201).json({
            success: true,
            message: "Offboarding initiated successfully",
            data: {
                offboarding: populatedOffboarding,
                workflow
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all offboarding cases
export const getOffboardings = async (req, res) => {
    try {
        const offboardings = await Offboarding
            .find()
            .populate("employee")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: offboardings.length,
            data: offboardings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get one offboarding case
export const getOffboardingById = async (req, res) => {
    try {
        const offboarding = await Offboarding
            .findById(req.params.id)
            .populate("employee");

        if (!offboarding) {
            return res.status(404).json({
                success: false,
                message: "Offboarding case not found"
            });
        }

        res.status(200).json({
            success: true,
            data: offboarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
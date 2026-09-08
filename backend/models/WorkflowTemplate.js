import mongoose from "mongoose";

const workflowStageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        role: {
            type: String,
            required: true,
            trim: true
        },

        order: {
            type: Number,
            required: true
        },

        mode: {
            type: String,
            enum: ["sequential", "parallel"],
            default: "sequential"
        },

        checklist: [
            {
                type: String,
                trim: true
            }
        ],

        reminderAfterHours: {
            type: Number,
            default: 24
        }
    },
    { _id: true }
);

const workflowTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        stages: {
            type: [workflowStageSchema],
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const WorkflowTemplate = mongoose.model(
    "WorkflowTemplate",
    workflowTemplateSchema
);

export default WorkflowTemplate;
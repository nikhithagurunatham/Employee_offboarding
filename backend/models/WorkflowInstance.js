import mongoose from "mongoose";

const workflowStageInstanceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true
        },

        order: {
            type: Number,
            required: true
        },

        mode: {
            type: String,
            enum: ["sequential", "parallel"],
            required: true
        },

        reminderAfterHours: {
            type: Number,
            default: 24
        },

        checklist: [
            {
                item: String,
                completed: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        status: {
            type: String,
            enum: ["Pending", "Active", "Approved", "Rejected"],
            default: "Pending"
        },

        approver: {
            userId: String,
            name: String,
            role: String
        },

        remarks: {
            type: String,
            default: ""
        },

        activatedAt: Date,
        lastReminderAt: Date,
        completedAt: Date
    },
    {
        _id: true
    }
);

const workflowInstanceSchema = new mongoose.Schema(
    {
        offboarding: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offboarding",
            required: true,
            unique: true
        },

        template: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowTemplate",
            required: true
        },

        stages: {
            type: [workflowStageInstanceSchema],
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed", "Rejected"],
            default: "Pending"
        },

        startedAt: {
            type: Date
        },

        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const WorkflowInstance = mongoose.model(
    "WorkflowInstance",
    workflowInstanceSchema
);

export default WorkflowInstance;
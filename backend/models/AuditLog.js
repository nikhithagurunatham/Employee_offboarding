import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        offboarding: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offboarding",
            required: true
        },

        workflow: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowInstance",
            required: true
        },

        stage: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        user: {
            userId: String,
            name: String,
            role: String
        },

        action: {
            type: String,
            enum: [
                "STAGE_ACTIVATED",
                "APPROVED",
                "REJECTED",
                "CHECKLIST_UPDATED",
                "REMINDER_SENT",
                "ACCESS_REVOKED"
            ],
            required: true
        },

        remarks: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
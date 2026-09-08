import mongoose from "mongoose";

const offboardingSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        resignationDate: {
            type: Date,
            required: true
        },

        lastWorkingDay: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Initiated",
                "In Progress",
                "Completed",
                "Rejected",
                "Cancelled"
            ],
            default: "Initiated"
        }
    },
    {
        timestamps: true
    }
);

const Offboarding = mongoose.model("Offboarding", offboardingSchema);

export default Offboarding;
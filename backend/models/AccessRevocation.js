import mongoose from "mongoose";

const accessRevocationSchema = new mongoose.Schema(
  {
    offboarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offboarding",
      required: true
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    emailAccessRevoked: {
      type: Boolean,
      default: false
    },

    systemAccessRevoked: {
      type: Boolean,
      default: false
    },

    systems: [
      {
        type: String,
        trim: true
      }
    ],

    revokedAt: {
      type: Date
    },

    revokedBy: {
      userId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: true
      }
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

const AccessRevocation = mongoose.model(
  "AccessRevocation",
  accessRevocationSchema
);

export default AccessRevocation;
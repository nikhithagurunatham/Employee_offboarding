import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    offboarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offboarding",
      required: true
    },

    recipient: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true }
    },

    type: {
      type: String,
      enum: [
        "STAGE_ACTIVATED",
        "REMINDER",
        "COMPLETED"
      ],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
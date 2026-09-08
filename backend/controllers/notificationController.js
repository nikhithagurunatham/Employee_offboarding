import Notification from "../models/Notification.js";
import Offboarding from "../models/Offboarding.js";
import AuditLog from "../models/AuditLog.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("offboarding")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getNotificationsByOffboarding = async (req, res) => {
  try {
    const notifications = await Notification.find({
      offboarding: req.params.offboardingId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const sendManualReminder = async (req, res) => {
  try {
    const { recipient, message } = req.body;

    if (!recipient || !recipient.userId || !recipient.name || !recipient.role || !req.body.workflowId || !req.body.stageId) {
      return res.status(400).json({
        success: false,
        message: "Recipient, workflowId and stageId are required"
      });
    }

    const offboarding = await Offboarding.findById(
      req.params.offboardingId
    );

    if (!offboarding) {
      return res.status(404).json({
        success: false,
        message: "Offboarding not found"
      });
    }

    const notification = await Notification.create({
      offboarding: offboarding._id,
      recipient,
      type: "REMINDER",
      message:
        message ||
        "Please complete your pending offboarding clearance."
    });

    await AuditLog.create({
      offboarding: offboarding._id,
      workflow: req.body.workflowId,
      stage: req.body.stageId,
      user: {
        userId: "HR001",
        name: "HR User",
        role: "HR"
      },
      action: "REMINDER_SENT",
      remarks: notification.message
    });

    res.status(201).json({
      success: true,
      message: "Reminder sent successfully",
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
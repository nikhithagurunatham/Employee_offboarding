import Notification from "../models/Notification.js";
import WorkflowInstance from "../models/WorkflowInstance.js";
import AuditLog from "../models/AuditLog.js";

const SYSTEM_USER = { userId: "SYSTEM", name: "System", role: "SYSTEM" };

export const createNotification = async ({
  offboarding,
  recipient,
  type,
  message
}) => {
  return await Notification.create({
    offboarding,
    recipient,
    type,
    message
  });
};

export const sendPendingStageReminders = async () => {
  const workflows = await WorkflowInstance.find({ status: "In Progress" });
  const now = Date.now();
  let remindersSent = 0;

  for (const workflow of workflows) {
    for (const stage of workflow.stages.filter((item) => item.status === "Active")) {
      const reminderAfterHours = stage.reminderAfterHours || 24;
      const dueAt = new Date(stage.activatedAt).getTime() + reminderAfterHours * 60 * 60 * 1000;
      const reminderAlreadySentToday = stage.lastReminderAt &&
        now - new Date(stage.lastReminderAt).getTime() < 24 * 60 * 60 * 1000;

      if (now < dueAt || reminderAlreadySentToday) continue;

      const recipient = {
        userId: `${stage.role}_USER`,
        name: `${stage.role.replaceAll("_", " ")} approver`,
        role: stage.role
      };
      const message = `${stage.name} is still pending. Please complete the required clearance.`;

      await Notification.create({
        offboarding: workflow.offboarding,
        recipient,
        type: "REMINDER",
        message
      });
      await AuditLog.create({
        offboarding: workflow.offboarding,
        workflow: workflow._id,
        stage: stage._id,
        user: SYSTEM_USER,
        action: "REMINDER_SENT",
        remarks: message
      });

      stage.lastReminderAt = new Date();
      remindersSent += 1;
    }
    if (workflow.isModified()) await workflow.save();
  }

  return remindersSent;
};
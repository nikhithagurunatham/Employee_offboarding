import WorkflowTemplate from "../models/WorkflowTemplate.js";
import WorkflowInstance from "../models/WorkflowInstance.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import Offboarding from "../models/Offboarding.js";
const ROLE_USERS = {
  PROJECT_MANAGER: {
    userId: "USR001",
    name: "Priya Sharma",
    role: "PROJECT_MANAGER"
  },

  ADMIN: {
    userId: "USR002",
    name: "Admin User",
    role: "ADMIN"
  },

  ACCOUNTS: {
    userId: "USR003",
    name: "Accounts User",
    role: "ACCOUNTS"
  },

  PERSONNEL: {
    userId: "USR004",
    name: "Personnel User",
    role: "PERSONNEL"
  },

  HR: {
    userId: "USR005",
    name: "HR User",
    role: "HR"
  }
};
const createStageNotification = async (offboardingId, stage) => {
  const recipient = ROLE_USERS[stage.role];

  if (!recipient) {
    console.log(`No user configured for role: ${stage.role}`);
    return;
  }

  await Notification.create({
    offboarding: offboardingId,
    recipient,
    type: "STAGE_ACTIVATED",
    message: `${stage.name} is now active. Please complete the required clearance.`
  });
};
export const createWorkflowInstance = async (offboardingId) => {
    const template = await WorkflowTemplate.findOne({
        name: "Employee Offboarding",
        isActive: true
    });

    if (!template) {
        throw new Error("Active offboarding workflow template not found");
    }

    const existingWorkflow = await WorkflowInstance.findOne({
        offboarding: offboardingId
    });

    if (existingWorkflow) {
        throw new Error("Workflow already exists for this offboarding");
    }

    const stages = template.stages.map((stage) => ({
        name: stage.name,
        role: stage.role,
        order: stage.order,
        mode: stage.mode,
        reminderAfterHours: stage.reminderAfterHours,
        checklist: stage.checklist.map((item) => ({
            item,
            completed: false
        })),
        status: stage.order === 1 ? "Active" : "Pending",
        activatedAt: stage.order === 1 ? new Date() : null
    }));

    const workflowInstance = await WorkflowInstance.create({
  offboarding: offboardingId,
  template: template._id,
  stages,
  status: "In Progress",
  startedAt: new Date()
});
await Offboarding.findByIdAndUpdate(
  offboardingId,
  { status: "In Progress" }
);
const firstStage = workflowInstance.stages.find(
  (stage) => stage.status === "Active"
);

if (firstStage) {
  await AuditLog.create({
    offboarding: workflowInstance.offboarding,
    workflow: workflowInstance._id,
    stage: firstStage._id,
    user: {
      userId: "SYSTEM",
      name: "System",
      role: "SYSTEM"
    },
    action: "STAGE_ACTIVATED",
    remarks: `${firstStage.name} activated`
  });

  await createStageNotification(
    workflowInstance.offboarding,
    firstStage
  );
}

    return workflowInstance;
};


// Approve or reject a workflow stage
// Approve or reject a workflow stage
export const processStage = async (
  workflowId,
  stageId,
  action,
  approver,
  remarks = "",
  checklist = []
) => {
  if (!approver || !approver.userId || !approver.name || !approver.role) {
    throw new Error("Approver identity is required");
  }

  const workflow = await WorkflowInstance.findById(workflowId);

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const stage = workflow.stages.id(stageId);

  if (!stage) {
    throw new Error("Workflow stage not found");
  }

  if (stage.status !== "Active") {
    throw new Error("This stage is not currently active");
  }

  // Update checklist
 // Update only the submitted checklist items
if (checklist.length > 0) {
  stage.checklist.forEach((item) => {
    const submittedItem = checklist.find(
      (submitted) => submitted.item === item.item
    );

    if (submittedItem) {
      item.completed = submittedItem.completed;
    }
  });
}

  // Reject stage
  if (action === "reject") {
    stage.status = "Rejected";
    stage.remarks = remarks;
    stage.approver = approver;
    stage.completedAt = new Date();

    workflow.status = "Rejected";
    await Offboarding.findByIdAndUpdate(
  workflow.offboarding,
  { status: "Rejected" }
);

    await AuditLog.create({
      offboarding: workflow.offboarding,
      workflow: workflow._id,
      stage: stage._id,
      user: approver,
      action: "REJECTED",
      remarks
    });

    await workflow.save();

    return workflow;
  }

  // Approve stage
  if (action === "approve") {
    const incompleteItems = stage.checklist.filter((item) => !item.completed);

    if (incompleteItems.length > 0) {
      throw new Error("All clearance checklist items must be completed before approval");
    }

    stage.status = "Approved";
    stage.remarks = remarks;
    stage.approver = approver;
    stage.completedAt = new Date();

    await AuditLog.create({
      offboarding: workflow.offboarding,
      workflow: workflow._id,
      stage: stage._id,
      user: approver,
      action: "APPROVED",
      remarks
    });

    // Find all stages in the current order
    const currentOrder = stage.order;

    const currentOrderStages = workflow.stages.filter(
      (item) => item.order === currentOrder
    );

    // Check whether every stage at this order is approved
    const allCurrentStagesApproved = currentOrderStages.every(
      (item) => item.status === "Approved"
    );

    if (allCurrentStagesApproved) {
      const pendingStages = workflow.stages.filter(
        (item) => item.status === "Pending"
      );

      const nextOrder =
        pendingStages.length > 0
          ? Math.min(...pendingStages.map((item) => item.order))
          : Infinity;

      if (nextOrder !== Infinity) {
        // Activate all stages at the next order
        workflow.stages.forEach((item) => {
          if (
            item.order === nextOrder &&
            item.status === "Pending"
          ) {
            item.status = "Active";
            item.activatedAt = new Date();
          }
        });

        // Find activated stages
        const activatedStages = workflow.stages.filter(
          (item) =>
            item.order === nextOrder &&
            item.status === "Active"
        );

        // Create audit logs and notifications
        for (const activatedStage of activatedStages) {
          // Audit activation
          await AuditLog.create({
            offboarding: workflow.offboarding,
            workflow: workflow._id,
            stage: activatedStage._id,
            user: {
              userId: "SYSTEM",
              name: "System",
              role: "SYSTEM"
            },
            action: "STAGE_ACTIVATED",
            remarks: `${activatedStage.name} activated`
          });

          // Send notification
          await createStageNotification(
            workflow.offboarding,
            activatedStage
          );
        }
      } else {
        // No pending stages remain
        workflow.status = "Completed";
        workflow.completedAt = new Date();
         await Offboarding.findByIdAndUpdate(
    workflow.offboarding,
    { status: "Completed" }
  );
        // Completion notification to HR
        await Notification.create({
          offboarding: workflow.offboarding,
          recipient: ROLE_USERS.HR,
          type: "COMPLETED",
          message:
            "Employee offboarding workflow has been completed successfully."
        });
      }
    }

    await workflow.save();

    return workflow;
  }

  throw new Error("Action must be either approve or reject");
};
export const checkAndSendReminders = async () => {
  try {
    const workflows = await WorkflowInstance.find({
      status: "In Progress"
    });

    for (const workflow of workflows) {
      const activeStages = workflow.stages.filter(
        (stage) => stage.status === "Active"
      );

      for (const stage of activeStages) {
        if (!stage.activatedAt || !stage.reminderAfterHours) {
          continue;
        }

        const now = new Date();

        const elapsedHours =
          (now - new Date(stage.activatedAt)) / (1000 * 60 * 60);

        if (elapsedHours < stage.reminderAfterHours) {
          continue;
        }

        const recipient = ROLE_USERS[stage.role];

        if (!recipient) {
          continue;
        }

        // Check whether a reminder was already sent for this stage
        const existingReminder = await Notification.findOne({
          offboarding: workflow.offboarding,
          type: "REMINDER",
          message: {
            $regex: stage.name,
            $options: "i"
          }
        });

        if (existingReminder) {
          continue;
        }

        await Notification.create({
          offboarding: workflow.offboarding,
          recipient,
          type: "REMINDER",
          message: `Reminder: ${stage.name} is still pending. Please complete the required clearance.`
        });

        await AuditLog.create({
          offboarding: workflow.offboarding,
          workflow: workflow._id,
          stage: stage._id,
          user: {
            userId: "SYSTEM",
            name: "System",
            role: "SYSTEM"
          },
          action: "REMINDER_SENT",
          remarks: `Automatic reminder sent for ${stage.name}`
        });

        console.log(
          `Automatic reminder sent for ${stage.name} - workflow ${workflow._id}`
        );
      }
    }
  } catch (error) {
    console.error("Reminder check failed:", error.message);
  }
};
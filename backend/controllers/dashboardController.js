import Offboarding from "../models/Offboarding.js";
import WorkflowInstance from "../models/WorkflowInstance.js";
import AuditLog from "../models/AuditLog.js";
import AccessRevocation from "../models/AccessRevocation.js";

export const getOffboardingDashboard = async (req, res) => {
  try {
    const { offboardingId } = req.params;

    // Get offboarding + employee details
    const offboarding = await Offboarding.findById(offboardingId)
      .populate("employee");

    if (!offboarding) {
      return res.status(404).json({
        success: false,
        message: "Offboarding record not found"
      });
    }

    // Get workflow
    const workflow = await WorkflowInstance.findOne({
      offboarding: offboardingId
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found for this offboarding"
      });
    }

    // Get audit history
    const auditLogs = await AuditLog.find({
      offboarding: offboardingId
    }).sort({ createdAt: 1 });

    // Get access revocation record
    const accessRevocation = await AccessRevocation.findOne({
      offboarding: offboardingId
    });

    // Calculate stage counts
    const totalStages = workflow.stages.length;

    const completedStages = workflow.stages.filter(
      (stage) => stage.status === "Approved"
    ).length;

    const activeStages = workflow.stages.filter(
      (stage) => stage.status === "Active"
    );

    const pendingStages = workflow.stages.filter(
      (stage) => stage.status === "Pending"
    );

    const rejectedStages = workflow.stages.filter(
      (stage) => stage.status === "Rejected"
    );

    // Calculate progress percentage
    const progressPercentage =
      totalStages > 0
        ? Math.round((completedStages / totalStages) * 100)
        : 0;

    // Current approvers
    const currentApprovers = activeStages.map((stage) => ({
      stageId: stage._id,
      stageName: stage.name,
      role: stage.role,
      approver: stage.approver || null,
      activatedAt: stage.activatedAt
    }));

    res.status(200).json({
      success: true,

      data: {
        employee: offboarding.employee,

        offboarding: {
          id: offboarding._id,
          resignationDate: offboarding.resignationDate,
          lastWorkingDay: offboarding.lastWorkingDay,
          reason: offboarding.reason,
          status: offboarding.status
        },

        workflow: {
          id: workflow._id,
          status: workflow.status,
          startedAt: workflow.startedAt,
          completedAt: workflow.completedAt,
          progress: {
            completed: completedStages,
            active: activeStages.length,
            pending: pendingStages.length,
            rejected: rejectedStages.length,
            total: totalStages,
            percentage: progressPercentage
          }
        },

        stages: workflow.stages,

        currentApprovers,

        accessRevocation: accessRevocation
          ? {
              emailAccessRevoked:
                accessRevocation.emailAccessRevoked,

              systemAccessRevoked:
                accessRevocation.systemAccessRevoked,

              systems: accessRevocation.systems,

              revokedAt: accessRevocation.revokedAt,

              revokedBy: accessRevocation.revokedBy,

              remarks: accessRevocation.remarks
            }
          : null,

        timeline: auditLogs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
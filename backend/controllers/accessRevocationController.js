import AccessRevocation from "../models/AccessRevocation.js";
import Offboarding from "../models/Offboarding.js";
import AuditLog from "../models/AuditLog.js";


// Create access revocation record
export const createAccessRevocation = async (req, res) => {
  try {
    const {
      offboardingId,
      employeeId,
      emailAccessRevoked,
      systemAccessRevoked,
      systems,
      revokedBy,
      remarks
    } = req.body;

    if (!offboardingId || !employeeId || !revokedBy) {
      return res.status(400).json({
        success: false,
        message: "offboardingId, employeeId and revokedBy are required"
      });
    }

    const offboarding = await Offboarding.findById(offboardingId);

    if (!offboarding) {
      return res.status(404).json({
        success: false,
        message: "Offboarding record not found"
      });
    }

    const existingRecord = await AccessRevocation.findOne({
      offboarding: offboardingId
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "Access revocation record already exists for this offboarding"
      });
    }

    const accessRevocation = await AccessRevocation.create({
      offboarding: offboardingId,
      employee: employeeId,
      emailAccessRevoked: emailAccessRevoked || false,
      systemAccessRevoked: systemAccessRevoked || false,
      systems: systems || [],
      revokedAt: new Date(),
      revokedBy,
      remarks: remarks || ""
    });

    // Add access revocation to audit history
    await AuditLog.create({
      offboarding: offboardingId,
      workflow: req.body.workflowId,
      stage: req.body.stageId,
      user: revokedBy,
      action: "ACCESS_REVOKED",
      remarks: remarks || "Employee access revoked"
    });

    res.status(201).json({
      success: true,
      message: "Access revocation recorded successfully",
      data: accessRevocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get all access revocation records
export const getAccessRevocations = async (req, res) => {
  try {
    const records = await AccessRevocation.find()
      .populate("employee")
      .populate("offboarding")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get access revocation by offboarding
export const getAccessRevocationByOffboarding = async (req, res) => {
  try {
    const record = await AccessRevocation.findOne({
      offboarding: req.params.offboardingId
    })
      .populate("employee")
      .populate("offboarding");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Access revocation record not found"
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
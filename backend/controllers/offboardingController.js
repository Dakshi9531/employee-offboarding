import Offboarding from "../models/Offboarding.js";
import Employee from "../models/Employee.js";
import AuditLog from "../models/AuditLog.js";
import WorkflowStage from "../models/WorkflowStage.js";
import {
  createWorkflowStages,
  handleStageUpdate,
  checkAndActivateHR,
  completeOffboarding,
} from "../services/offboardingService.js";

export const createOffboarding = async (req, res) => {
  try {
    const { employeeId, resignationDate, lastWorkingDay, reason } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const stages = await createWorkflowStages();

    const offboarding = await Offboarding.create({
      employee: employee._id,
      resignationDate,
      lastWorkingDay,
      reason,
      workflowStages: stages.map((s) => s._id),
    });

    employee.status = "On Notice";
    await employee.save();

    await AuditLog.create({
      offboardingId: offboarding._id,
      action: "Offboarding initiated",
      role: "HR",
      user: "HR",
      remarks: `Offboarding started for ${employee.name}. Resignation date: ${resignationDate}, Last working day: ${lastWorkingDay}`,
    });

    const populated = await Offboarding.findById(offboarding._id)
      .populate("employee")
      .populate("workflowStages");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOffboardings = async (req, res) => {
  try {
    const offboardings = await Offboarding.find()
      .populate("employee")
      .populate("workflowStages")
      .sort({ createdAt: -1 });
    res.json(offboardings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOffboardingById = async (req, res) => {
  try {
    const offboarding = await Offboarding.findById(req.params.id)
      .populate("employee")
      .populate("workflowStages");

    if (!offboarding) {
      return res.status(404).json({ message: "Offboarding not found" });
    }

    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkflowStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { status, remarks, user } = req.body;

    const stage = await WorkflowStage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    const offboarding = await Offboarding.findOne({ workflowStages: stageId });
    if (!offboarding) {
      return res.status(404).json({ message: "Offboarding not found for this stage" });
    }

    const updatedStage = await handleStageUpdate(stageId, status, remarks, user);

    // Create audit log
    const actionText = status === "Approved"
      ? `${stage.stageName} - Approved`
      : `${stage.stageName} - Rejected`;

    await AuditLog.create({
      offboardingId: offboarding._id,
      action: actionText,
      role: stage.role,
      user: user || "",
      remarks: remarks || "",
    });

    // Check if HR should be activated
    const { allApproved, anyRejected, hrStage } = await checkAndActivateHR(
      offboarding._id,
      offboarding
    );

    // If HR approved, complete the offboarding
    if (status === "Approved" && stage.role === "HR") {
      await completeOffboarding(offboarding._id, offboarding);
    }

    // Refresh offboarding data
    const refreshed = await Offboarding.findById(offboarding._id)
      .populate("employee")
      .populate("workflowStages");

    res.json(refreshed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ offboardingId: req.params.id }).sort({
      createdAt: 1,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

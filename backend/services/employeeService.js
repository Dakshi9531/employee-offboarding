import WorkflowStage from "../models/WorkflowStage.js";
import AuditLog from "../models/AuditLog.js";

const STAGES_CONFIG = [
  { stageName: "Project / Reporting Manager", role: "Manager" },
  { stageName: "Admin & Systems", role: "Admin" },
  { stageName: "Accounts", role: "Accounts" },
  { stageName: "Personnel", role: "Personnel" },
  { stageName: "HR Final Clearance", role: "HR" },
];

export const createWorkflowStages = async (offboardingId) => {
  const stages = [];

  for (const stage of STAGES_CONFIG) {
    const status = stage.role === "HR" ? "Waiting" : "Pending";
    const s = await WorkflowStage.create({
      stageName: stage.stageName,
      role: stage.role,
      status,
    });
    stages.push(s);
  }

  // Activate the first four stages in parallel
  const parallelRoles = ["Manager", "Admin", "Accounts", "Personnel"];
  for (const stage of stages) {
    if (parallelRoles.includes(stage.role)) {
      stage.status = "Active";
      await stage.save();
    }
  }

  return stages;
};

export const handleStageUpdate = async (stageId, status, remarks, user) => {
  const stage = await WorkflowStage.findById(stageId);
  if (!stage) throw new Error("Stage not found");

  stage.status = status;
  stage.remarks = remarks || "";
  stage.approvedBy = user || "";
  stage.approvedAt = new Date();
  await stage.save();

  return stage;
};

export const checkAndActivateHR = async (offboardingId, offboarding) => {
  const stages = await WorkflowStage.find({
    _id: { $in: offboarding.workflowStages },
  });

  const parallelStages = stages.filter((s) => s.role !== "HR");
  const allApproved = parallelStages.every((s) => s.status === "Approved");
  const anyRejected = parallelStages.some((s) => s.status === "Rejected");

  const hrStage = stages.find((s) => s.role === "HR");

  if (allApproved && hrStage && hrStage.status === "Waiting") {
    hrStage.status = "Active";
    await hrStage.save();

    await AuditLog.create({
      offboardingId,
      action: "HR stage activated - all parallel stages approved",
      role: "System",
      user: "System",
      remarks: "All four parallel stages have been approved. HR stage is now active.",
    });
  }

  if (anyRejected && hrStage) {
    hrStage.status = "Waiting";
    await hrStage.save();
  }

  return { allApproved, anyRejected, hrStage };
};

export const completeOffboarding = async (offboardingId, offboarding) => {
  offboarding.status = "Completed";
  await offboarding.save();

  await AuditLog.create({
    offboardingId,
    action: "Offboarding completed",
    role: "HR",
    user: "HR",
    remarks: "All clearance stages approved. Offboarding completed.",
  });
};

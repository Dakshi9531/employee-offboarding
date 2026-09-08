import Employee from "../models/Employee.js";
import Offboarding from "../models/Offboarding.js";
import WorkflowStage from "../models/WorkflowStage.js";
import AuditLog from "../models/AuditLog.js";

const STAGES_CONFIG = [
  { stageName: "Project / Reporting Manager", role: "Manager" },
  { stageName: "Admin & Systems", role: "Admin" },
  { stageName: "Accounts", role: "Accounts" },
  { stageName: "Personnel", role: "Personnel" },
  { stageName: "HR Final Clearance", role: "HR" },
];

export const createOffboarding = async (data) => {
  const employee = await Employee.findOne({
    employeeId: data.employeeId,
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  employee.status = "On Notice";
  await employee.save();

  const offboarding = await Offboarding.create({
    employee: employee._id,
    resignationDate: data.resignationDate,
    lastWorkingDay: data.lastWorkingDay,
    reason: data.reason,
    status: "In Progress",
  });

  const workflowStages = await createWorkflowStages(
    offboarding._id
  );

  offboarding.workflowStages = workflowStages.map(
    (stage) => stage._id
  );

  await offboarding.save();

  await AuditLog.create({
    offboardingId: offboarding._id,
    action: "Offboarding initiated",
    role: "HR",
    user: "HR",
    remarks: "Offboarding workflow created",
  });

  return await getOffboardingById(offboarding._id);
};

export const getOffboardings = async () => {
  const offboardings = await Offboarding.find()
    .populate("employee")
    .sort({ createdAt: -1 });

  for (const offboarding of offboardings) {
    offboarding.workflowStages =
      await WorkflowStage.find({
        _id: { $in: offboarding.workflowStages },
      });
  }

  return offboardings;
};

export const getOffboardingById = async (id) => {
  const offboarding = await Offboarding.findById(id)
    .populate("employee");

  if (!offboarding) {
    throw new Error("Offboarding record not found");
  }

  const workflowStages = await WorkflowStage.find({
    _id: { $in: offboarding.workflowStages },
  });

  return {
    ...offboarding.toObject(),
    workflowStages,
  };
};

export const createWorkflowStages = async (offboardingId) => {
  const stages = [];

  for (const stage of STAGES_CONFIG) {
    const status =
      stage.role === "HR" ? "Waiting" : "Pending";

    const s = await WorkflowStage.create({
      offboarding: offboardingId,
      stageName: stage.stageName,
      role: stage.role,
      status,
    });

    stages.push(s);
  }

  // Activate the first four stages in parallel
  const parallelRoles = [
    "Manager",
    "Admin",
    "Accounts",
    "Personnel",
  ];

  for (const stage of stages) {
    if (parallelRoles.includes(stage.role)) {
      stage.status = "Active";
      await stage.save();
    }
  }

  return stages;
};

export const handleStageUpdate = async (
  stageId,
  status,
  remarks,
  user,
  data = {}
) => {
  const stage = await WorkflowStage.findById(stageId);

  if (!stage) {
    throw new Error("Stage not found");
  }

  if (stage.status !== "Active") {
    throw new Error("This stage is not active");
  }

  stage.status = status;
  stage.remarks = remarks || "";

  if (status === "Approved") {
    stage.approvedBy = user || "";
    stage.approvedAt = new Date();
  }

  // Admin & Systems clearance
  if (stage.role === "Admin") {
    stage.emailAccessRevoked =
      data.emailAccessRevoked || false;

    stage.systemAccessRevoked =
      data.systemAccessRevoked || false;

    if (
      stage.emailAccessRevoked ||
      stage.systemAccessRevoked
    ) {
      stage.revocationUser = user || "";
      stage.revocationTimestamp = new Date();
    }
  }

  await stage.save();

  await AuditLog.create({
    offboardingId: stage.offboarding,
    action: `Workflow stage ${status}`,
    role: stage.role,
    user: user || "",
    remarks: remarks || "",
  });

  const offboarding = await Offboarding.findById(
    stage.offboarding
  );

  if (!offboarding) {
    throw new Error("Offboarding record not found");
  }

  const result = await checkAndActivateHR(
    stage.offboarding,
    offboarding
  );

  // If HR is approved, complete the offboarding
  if (
    stage.role === "HR" &&
    status === "Approved"
  ) {
    await completeOffboarding(
      stage.offboarding,
      offboarding
    );
  }

  return await getOffboardingById(stage.offboarding);
};

export const checkAndActivateHR = async (
  offboardingId,
  offboarding
) => {
  const stages = await WorkflowStage.find({
    _id: { $in: offboarding.workflowStages },
  });

  const parallelStages = stages.filter(
    (stage) => stage.role !== "HR"
  );

  const allApproved =
    parallelStages.length === 4 &&
    parallelStages.every(
      (stage) => stage.status === "Approved"
    );

  const anyRejected = parallelStages.some(
    (stage) => stage.status === "Rejected"
  );

  const hrStage = stages.find(
    (stage) => stage.role === "HR"
  );

  if (
    allApproved &&
    hrStage &&
    hrStage.status === "Waiting"
  ) {
    hrStage.status = "Active";

    await hrStage.save();

    await AuditLog.create({
      offboardingId,
      action:
        "HR stage activated - all parallel stages approved",
      role: "System",
      user: "System",
      remarks:
        "All four parallel stages have been approved. HR stage is now active.",
    });
  }

  if (anyRejected && hrStage) {
    hrStage.status = "Waiting";
    await hrStage.save();
  }

  return {
    allApproved,
    anyRejected,
    hrStage,
  };
};

export const completeOffboarding = async (
  offboardingId,
  offboarding
) => {
  offboarding.status = "Completed";
  await offboarding.save();

  const employee = await Employee.findById(
    offboarding.employee
  );

  if (employee) {
    employee.status = "Offboarded";
    await employee.save();
  }

  await AuditLog.create({
    offboardingId,
    action: "Offboarding completed",
    role: "HR",
    user: "HR",
    remarks:
    "All clearance stages approved. Offboarding completed.",
});
};

export const getAuditLogs = async (offboardingId) => {
return await AuditLog.find({
    offboardingId,
}).sort({ createdAt: -1 });
};
const API_BASE = "http://localhost:5000/api";

export const fetchEmployees = async () => {
  const res = await fetch(`${API_BASE}/employees`);
  return res.json();
};

export const createEmployee = async (data) => {
  const res = await fetch(`${API_BASE}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchOffboardings = async () => {
  const res = await fetch(`${API_BASE}/offboardings`);
  return res.json();
};

export const fetchOffboardingById = async (id) => {
  const res = await fetch(`${API_BASE}/offboardings/${id}`);
  return res.json();
};

export const createOffboarding = async (data) => {
  const res = await fetch(`${API_BASE}/offboardings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateWorkflowStage = async (stageId, data) => {
  const res = await fetch(`${API_BASE}/offboardings/stage/${stageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchAuditLogs = async (offboardingId) => {
  const res = await fetch(`${API_BASE}/offboardings/${offboardingId}/audit-logs`);
  return res.json();
};

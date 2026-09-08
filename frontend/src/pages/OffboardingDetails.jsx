import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchOffboardingById,
  updateWorkflowStage,
  fetchAuditLogs,
} from "../api/api.js";

function OffboardingDetails() {
  const { id } = useParams();
  const [offboarding, setOffboarding] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [offData, logData] = await Promise.all([
        fetchOffboardingById(id),
        fetchAuditLogs(id),
      ]);
      setOffboarding(offData);
      setAuditLogs(logData);
    } catch (err) {
      console.error("Failed to load offboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (stageId, status) => {
    const remarks = remarksMap[stageId] || "";
    const user = userMap[stageId] || "";
    try {
      const result = await updateWorkflowStage(stageId, { status, remarks, user });
      setOffboarding(result);
      const logs = await fetchAuditLogs(id);
      setAuditLogs(logs);
      setRemarksMap({ ...remarksMap, [stageId]: "" });
      setUserMap({ ...userMap, [stageId]: "" });
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  };

  const getStatusBadge = (status) => {
    const classMap = {
      Approved: "badge-approved",
      Rejected: "badge-rejected",
      Active: "badge-active",
      Pending: "badge-pending",
      Waiting: "badge-waiting",
    };
    return `badge ${classMap[status] || "badge-pending"}`;
  };

  if (loading) return <p>Loading offboarding details...</p>;
  if (!offboarding || offboarding.message) return <p>Offboarding not found.</p>;

  const emp = offboarding.employee;

  return (
    <div>
      <h1 className="page-title">Offboarding Details</h1>

      <div className="two-col">
        <div className="card">
          <h3>Employee Information</h3>
          <div className="employee-info">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span>{emp?.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span>{emp?.employeeId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span>{emp?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department:</span>
              <span>{emp?.department}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Designation:</span>
              <span>{emp?.designation}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Manager:</span>
              <span>{emp?.manager}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Resignation Information</h3>
          <div className="employee-info">
            <div className="info-item">
              <span className="info-label">Resignation Date:</span>
              <span>{new Date(offboarding.resignationDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Working Day:</span>
              <span>{new Date(offboarding.lastWorkingDay).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`badge badge-${offboarding.status === "Completed" ? "completed" : "in-progress"}`}>
                {offboarding.status}
              </span>
            </div>
            {offboarding.reason && (
              <div className="info-item">
                <span className="info-label">Reason:</span>
                <span>{offboarding.reason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Workflow Stages</h3>
        {offboarding.workflowStages?.map((stage) => (
          <div key={stage._id} className="workflow-stage">
            <div style={{ flex: 1 }}>
              <div className="stage-name">{stage.stageName}</div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                Role: {stage.role}
                {stage.approvedBy && ` | By: ${stage.approvedBy}`}
                {stage.approvedAt && ` | At: ${new Date(stage.approvedAt).toLocaleString()}`}
                {stage.remarks && ` | Remarks: ${stage.remarks}`}
              </div>
              {stage.role === "Admin" && (stage.emailAccessRevoked || stage.systemAccessRevoked) && (
                <div style={{ fontSize: "0.8rem", color: "#1565c0", marginTop: "0.25rem" }}>
                  Email Revoked: {stage.emailAccessRevoked ? "Yes" : "No"} |
                  System Revoked: {stage.systemAccessRevoked ? "Yes" : "No"}
                  {stage.revocationUser && ` | By: ${stage.revocationUser}`}
                  {stage.revocationTimestamp && ` | At: ${new Date(stage.revocationTimestamp).toLocaleString()}`}
                </div>
              )}
            </div>
            <div className="stage-actions">
              <span className={getStatusBadge(stage.status)}>{stage.status}</span>
              {(stage.status === "Active") && (
                <>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={userMap[stage._id] || ""}
                    onChange={(e) => setUserMap({ ...userMap, [stage._id]: e.target.value })}
                    style={{ width: "120px" }}
                  />
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={remarksMap[stage._id] || ""}
                    onChange={(e) => setRemarksMap({ ...remarksMap, [stage._id]: e.target.value })}
                    style={{ width: "150px" }}
                  />
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAction(stage._id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleAction(stage._id, "Rejected")}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Audit Timeline</h3>
        {auditLogs.length === 0 ? (
          <div className="empty-state">No audit logs yet.</div>
        ) : (
          auditLogs.map((log) => (
            <div key={log._id} className="audit-item">
              <div className="audit-action">{log.action}</div>
              <div className="audit-meta">
                Role: {log.role} | User: {log.user} | Time:{" "}
                {new Date(log.createdAt).toLocaleString()}
              </div>
              {log.remarks && <div className="audit-remarks">{log.remarks}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OffboardingDetails;

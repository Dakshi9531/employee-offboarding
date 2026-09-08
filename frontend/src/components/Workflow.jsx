import { useState } from "react";

import {
  updateWorkflowStage,
  fetchAuditLogs,
} from "../services/api";

function Workflow({ offboarding, onUpdated }) {
  const [user, setUser] = useState("HR");
  const [remarks, setRemarks] = useState("");

  const [emailAccessRevoked, setEmailAccessRevoked] =
    useState(false);

  const [systemAccessRevoked, setSystemAccessRevoked] =
    useState(false);

  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const [error, setError] = useState("");

  const stages = offboarding.workflowStages || [];

  const handleStageUpdate = async (
    stage,
    status
  ) => {
    try {
      setError("");

      const data = {
        status,
        remarks,
        user,
      };

      // Admin & Systems
      if (stage.role === "Admin") {
        data.emailAccessRevoked =
          emailAccessRevoked;

        data.systemAccessRevoked =
          systemAccessRevoked;
      }

      await updateWorkflowStage(
        stage._id,
        data
      );

      setRemarks("");
      setEmailAccessRevoked(false);
      setSystemAccessRevoked(false);

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAuditLogs = async () => {
    try {
      setError("");

      const data = await fetchAuditLogs(
        offboarding._id
      );

      setLogs(
        Array.isArray(data)
          ? data
          : data.logs || []
      );

      setShowLogs(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="workflow">
      <h2>Offboarding Workflow</h2>

      <div className="employee-info">
        <p>
          <strong>Employee:</strong>{" "}
          {offboarding.employee?.name}
        </p>

        <p>
          <strong>Employee ID:</strong>{" "}
          {offboarding.employee?.employeeId}
        </p>

        <p>
          <strong>Offboarding Status:</strong>{" "}
          {offboarding.status}
        </p>
      </div>

      <div className="card">
        <h3>Approval Details</h3>

        <input
          type="text"
          placeholder="User / Approver"
          value={user}
          onChange={(e) =>
            setUser(e.target.value)
          }
        />

        <textarea
          placeholder="Remarks"
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
          }
        />
      </div>

      {error && (
        <p className="error">{error}</p>
      )}

      <div className="stages">
        {stages.map((stage, index) => (
          <div
            className="stage"
            key={stage._id}
          >
            <h3>
              {index + 1}.{" "}
              {stage.stageName}
            </h3>

            <p>
              <strong>Role:</strong>{" "}
              {stage.role}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="status">
                {stage.status}
              </span>
            </p>

            {/* Admin & Systems */}
            {stage.role === "Admin" &&
              stage.status === "Active" && (
                <div className="access-section">
                  <h4>
                    System Access Revocation
                  </h4>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        emailAccessRevoked
                      }
                      onChange={(e) =>
                        setEmailAccessRevoked(
                          e.target.checked
                        )
                      }
                    />

                    Revoke Email Access
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        systemAccessRevoked
                      }
                      onChange={(e) =>
                        setSystemAccessRevoked(
                          e.target.checked
                        )
                      }
                    />

                    Revoke System Access
                  </label>
                </div>
              )}

            {/* Active Stage */}
            {stage.status === "Active" && (
              <div className="stage-buttons">
                <button
                  onClick={() =>
                    handleStageUpdate(
                      stage,
                      "Approved"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  className="reject"
                  onClick={() =>
                    handleStageUpdate(
                      stage,
                      "Rejected"
                    )
                  }
                >
                  Reject
                </button>
              </div>
            )}

            {/* Approved Information */}
            {stage.approvedBy && (
              <p>
                <strong>Approved By:</strong>{" "}
                {stage.approvedBy}
              </p>
            )}

            {stage.approvedAt && (
              <p>
                <strong>Approved At:</strong>{" "}
                {new Date(
                  stage.approvedAt
                ).toLocaleString()}
              </p>
            )}

            {stage.remarks && (
              <p>
                <strong>Remarks:</strong>{" "}
                {stage.remarks}
              </p>
            )}

            {/* Access Revocation Details */}
            {stage.emailAccessRevoked && (
              <p>
                ✓ Email access revoked
              </p>
            )}

            {stage.systemAccessRevoked && (
              <p>
                ✓ System access revoked
              </p>
            )}

            {stage.revocationUser && (
              <p>
                <strong>Revoked By:</strong>{" "}
                {stage.revocationUser}
              </p>
            )}

            {stage.revocationTimestamp && (
              <p>
                <strong>Revocation Time:</strong>{" "}
                {new Date(
                  stage.revocationTimestamp
                ).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleAuditLogs}>
        View Audit Logs
      </button>

      {showLogs && (
        <div className="audit-logs">
          <h3>Audit Logs</h3>

          {logs.length === 0 ? (
            <p>No audit logs found.</p>
          ) : (
            logs.map((log) => (
              <div
                className="log"
                key={log._id}
              >
                <p>
                  <strong>Action:</strong>{" "}
                  {log.action}
                </p>

                <p>
                  <strong>User:</strong>{" "}
                  {log.user}
                </p>

                <p>
                  <strong>Role:</strong>{" "}
                  {log.role}
                </p>

                <p>
                  <strong>Remarks:</strong>{" "}
                  {log.remarks}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(
                    log.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Workflow;
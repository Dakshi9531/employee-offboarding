import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchOffboardings, fetchEmployees } from "../api/api.js";

function Dashboard() {
  const [offboardings, setOffboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [offData, empData] = await Promise.all([
        fetchOffboardings(),
        fetchEmployees(),
      ]);
      setOffboardings(offData);
      setEmployees(empData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = offboardings.filter(
    (o) => o.status === "In Progress"
  ).length;
  const completedCount = offboardings.filter(
    (o) => o.status === "Completed"
  ).length;
  const totalEmployees = employees.length;

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="page-title">HR Offboarding Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalEmployees}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active Offboardings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="card">
        <h3>Offboarding Cases</h3>
        {offboardings.length === 0 ? (
          <div className="empty-state">
            No offboarding cases yet.{" "}
            <Link to="/offboarding/new">Create one</Link>
          </div>
        ) : (
          offboardings.map((off) => {
            const emp = off.employee;
            const activeStage = off.workflowStages?.find(
              (s) => s.status === "Active"
            );
            const completedStages = off.workflowStages?.filter(
              (s) => s.status === "Approved"
            ).length;
            const totalStages = off.workflowStages?.length || 5;

            return (
              <Link
                key={off._id}
                to={`/offboarding/${off._id}`}
                className="offboarding-list-item"
              >
                <div>
                  <strong>{emp?.name || "Unknown"}</strong>
                  <span style={{ color: "#666", marginLeft: "0.5rem" }}>
                    ({emp?.employeeId})
                  </span>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
                    Resignation: {new Date(off.resignationDate).toLocaleDateString()} |
                    Last Day: {new Date(off.lastWorkingDay).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`badge badge-${off.status === "Completed" ? "completed" : "in-progress"}`}
                  >
                    {off.status}
                  </span>
                  <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                    {completedStages}/{totalStages} stages |
                    {activeStage ? ` Active: ${activeStage.stageName}` : " Done"}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Dashboard;

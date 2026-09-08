import { useState, useEffect } from "react";
import { fetchEmployees, createEmployee } from "../api/api.js";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    manager: "",
    status: "Active",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await createEmployee(form);
      if (result.message && !result.employeeId) {
        setError(result.message);
        return;
      }
      setEmployees([result, ...employees]);
      setForm({
        employeeId: "",
        name: "",
        email: "",
        department: "",
        designation: "",
        manager: "",
        status: "Active",
      });
      setShowForm(false);
    } catch (err) {
      setError("Failed to create employee");
    }
  };

  if (loading) return <p>Loading employees...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Employees</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Add New Employee</h3>
          <form onSubmit={handleSubmit}>
            <div className="two-col">
              <div className="form-group">
                <label>Employee ID</label>
                <input name="employeeId" value={form.employeeId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input name="department" value={form.department} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input name="designation" value={form.designation} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Manager</label>
                <input name="manager" value={form.manager} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Create Employee</button>
          </form>
        </div>
      )}

      <div className="card">
        {employees.length === 0 ? (
          <div className="empty-state">No employees found. Add one above.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Manager</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.employeeId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.manager}</td>
                  <td>
                    <span
                      className={`badge ${emp.status === "Active" ? "badge-approved" : emp.status === "On Notice" ? "badge-active" : "badge-waiting"}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Employees;

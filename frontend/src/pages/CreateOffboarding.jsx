import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployees, createOffboarding } from "../api/api.js";

function CreateOffboarding() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    resignationDate: "",
    lastWorkingDay: "",
    reason: "",
  });

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(form.lastWorkingDay) <= new Date(form.resignationDate)) {
      setError("Last working day must be after resignation date");
      return;
    }

    try {
      const result = await createOffboarding(form);
      if (result.message && !result._id) {
        setError(result.message);
        return;
      }
      navigate(`/offboarding/${result._id}`);
    } catch (err) {
      setError("Failed to create offboarding");
    }
  };

  return (
    <div>
      <h1 className="page-title">Initiate Offboarding</h1>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="form-group">
              <label>Employee ID</label>
              <select name="employeeId" value={form.employeeId} onChange={handleChange} required>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.employeeId} - {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Resignation Date</label>
              <input
                type="date"
                name="resignationDate"
                value={form.resignationDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Working Day</label>
              <input
                type="date"
                name="lastWorkingDay"
                value={form.lastWorkingDay}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Reason / Details</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Optional - reason for leaving"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Start Offboarding
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateOffboarding;

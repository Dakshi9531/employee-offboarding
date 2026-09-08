import { useState } from "react";
import { createOffboarding } from "../services/api";

function OffboardingForm({ onOffboardingCreated }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    resignationDate: "",
    lastWorkingDay: "",
    reason: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const data = await createOffboarding(formData);

      if (data.message || data._id || data.employee) {
        setMessage(
          "Offboarding process started successfully!"
        );

        setFormData({
          employeeId: "",
          resignationDate: "",
          lastWorkingDay: "",
          reason: "",
        });

        if (onOffboardingCreated) {
          onOffboardingCreated();
        }
      } else {
        setError(
          data.error || "Failed to start offboarding"
        );
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="card">
      <h2>Start Employee Offboarding</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          required
        />

        <label>Resignation Date</label>

        <input
          type="date"
          name="resignationDate"
          value={formData.resignationDate}
          onChange={handleChange}
          required
        />

        <label>Last Working Day</label>

        <input
          type="date"
          name="lastWorkingDay"
          value={formData.lastWorkingDay}
          onChange={handleChange}
          required
        />

        <textarea
          name="reason"
          placeholder="Reason for resignation"
          value={formData.reason}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Start Offboarding
        </button>
      </form>

      {message && (
        <p className="success">{message}</p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}
    </div>
  );
}

export default OffboardingForm;
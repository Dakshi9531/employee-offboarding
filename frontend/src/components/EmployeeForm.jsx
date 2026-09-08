import { useState } from "react";
import { createEmployee } from "../services/api.js";

function EmployeeForm({ onEmployeeCreated }) {
const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    manager: "",
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
    const data = await createEmployee(formData);

    if (data._id) {
        setMessage("Employee created successfully!");

        setFormData({
        employeeId: "",
        name: "",
        email: "",
        department: "",
        designation: "",
        manager: "",
        });

        if (onEmployeeCreated) {
        onEmployeeCreated();
        }
    } else {
        setError(data.message || data.error || "Failed to create employee");
    }
    } catch (error) {
    setError(error.message || "Something went wrong");
    }
};

return (
    <div className="card">
    <h2>Add Employee</h2>

    <form onSubmit={handleSubmit}>
        <input
        type="text"
        name="employeeId"
        placeholder="Employee ID"
        value={formData.employeeId}
        onChange={handleChange}
        required
        />

        <input
        type="text"
        name="name"
        placeholder="Employee Name"
        value={formData.name}
        onChange={handleChange}
        required
        />

        <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        />

        <input
        type="text"
        name="department"
        placeholder="Department"
        value={formData.department}
        onChange={handleChange}
        required
        />

        <input
        type="text"
        name="designation"
        placeholder="Designation"
        value={formData.designation}
        onChange={handleChange}
        required
        />

        <input
        type="text"
        name="manager"
        placeholder="Manager"
        value={formData.manager}
        onChange={handleChange}
        />

        <button type="submit">
        Add Employee
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

export default EmployeeForm;
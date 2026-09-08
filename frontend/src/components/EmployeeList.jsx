import { useEffect, useState } from "react";
import { fetchEmployees } from "../services/api";

function EmployeeList({ refresh }) {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();

      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [refresh]);

  return (
    <div className="card">
      <h2>Employees</h2>

      {error && (
        <p className="error">{error}</p>
      )}

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Manager</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>{employee.designation}</td>
                <td>{employee.manager}</td>
                <td>
                  <span className="status">
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeList;
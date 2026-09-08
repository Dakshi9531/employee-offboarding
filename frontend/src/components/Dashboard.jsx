function Dashboard({
  employees,
  offboardings,
}) {
  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Active"
    ).length;

  const onNoticeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "On Notice"
    ).length;

  const offboardedEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Offboarded"
    ).length;

  const inProgress =
    offboardings.filter(
      (item) =>
        item.status === "In Progress"
    ).length;

  const completed =
    offboardings.filter(
      (item) =>
        item.status === "Completed"
    ).length;

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h3>Total Employees</h3>
        <p>{employees.length}</p>
      </div>

      <div className="dashboard-card">
        <h3>Active Employees</h3>
        <p>{activeEmployees}</p>
      </div>

      <div className="dashboard-card">
        <h3>On Notice</h3>
        <p>{onNoticeEmployees}</p>
      </div>

      <div className="dashboard-card">
        <h3>Offboarded</h3>
        <p>{offboardedEmployees}</p>
      </div>

      <div className="dashboard-card">
        <h3>In Progress</h3>
        <p>{inProgress}</p>
      </div>

      <div className="dashboard-card">
        <h3>Completed</h3>
        <p>{completed}</p>
      </div>
    </div>
  );
}

export default Dashboard;
import Employee from "../models/Employee.js";

export const createEmployee = async (req, res) => {
  try {
    const { employeeId, name, email, department, designation, manager, status } = req.body;

    const existing = await Employee.findOne({ $or: [{ employeeId }, { email }] });
    if (existing) {
      return res.status(400).json({ message: "Employee with this ID or email already exists" });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      department,
      designation,
      manager,
      status,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

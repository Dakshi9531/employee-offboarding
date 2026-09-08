import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    manager: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive", "On Notice"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);

import mongoose from "mongoose";

const workflowStageSchema = new mongoose.Schema(
  {
    stageName: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Active", "Waiting", "Approved", "Rejected"],
      default: "Pending",
    },
    remarks: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    emailAccessRevoked: { type: Boolean, default: false },
    systemAccessRevoked: { type: Boolean, default: false },
    revocationUser: { type: String, default: "" },
    revocationTimestamp: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("WorkflowStage", workflowStageSchema);

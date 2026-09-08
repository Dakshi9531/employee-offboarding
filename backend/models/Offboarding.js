import mongoose from "mongoose";

const offboardingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    resignationDate: { type: Date, required: true },
    lastWorkingDay: { type: Date, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Cancelled"],
      default: "In Progress",
    },
    workflowStages: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowStage" },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Offboarding", offboardingSchema);

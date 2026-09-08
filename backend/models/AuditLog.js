import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    offboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offboarding",
      required: true,
    },
    action: { type: String, required: true },
    role: { type: String, default: "" },
    user: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);

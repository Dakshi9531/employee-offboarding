import express from "express";

import {
    createOffboarding,
    getOffboardings,
    getOffboardingById,
    updateWorkflowStage,
    getAuditLogs
} from "../controllers/offboardingController.js";

const router = express.Router();

// Create offboarding
router.post("/", createOffboarding);

// Get all offboardings
router.get("/", getOffboardings);

// Get one offboarding
router.get("/:id", getOffboardingById);

// Update / approve workflow stage
router.put("/stage/:stageId", updateWorkflowStage);

// Get audit logs
router.get("/:id/audit-logs", getAuditLogs);

export default router;
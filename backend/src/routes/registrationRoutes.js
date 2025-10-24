import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  registerForEvent,
  getAllRegistrations,
  updateRegistrationStatus
} from "../controllers/registrationController.js";

const router = express.Router();

// Volunteers can send registration requests
router.post("/", verifyToken, authorizeRoles("volunteer"), registerForEvent);

// Admins can view all registration requests
router.get("/", verifyToken, authorizeRoles("admin"), getAllRegistrations);

// Admins can approve/reject registration requests
router.put("/:registration_id", verifyToken, authorizeRoles("admin"), updateRegistrationStatus);

export default router;

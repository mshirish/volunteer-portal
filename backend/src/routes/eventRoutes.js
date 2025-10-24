import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), createEvent);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateEvent);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteEvent);

export default router;

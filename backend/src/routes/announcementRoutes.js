import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementsByEvent,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ Get all announcements (with optional filters)
router.get("/", verifyToken, getAnnouncements);

// ✅ Get announcements for a specific event
router.get("/event/:event_id", verifyToken, getAnnouncementsByEvent);

// ✅ Admin-only actions
router.post("/", verifyToken, authorizeRoles("admin"), createAnnouncement);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateAnnouncement);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteAnnouncement);

export default router;

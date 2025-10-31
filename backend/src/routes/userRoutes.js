import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

export default router;

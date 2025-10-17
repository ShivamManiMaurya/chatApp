import express from "express";
import {
  login,
  logout,
  signup,
  uploadProfilePic,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/uploadProfilePic", uploadProfilePic);

router.get("/check", protectedRoute, (req, res) => {
  res.status(200).json("User authenticated sucessfully.");
});

export default router;

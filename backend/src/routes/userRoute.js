import express from "express";
import {
  registerUser,
  login,
  logout,
  resendOTP,
  validateOTP,
  resetPassword,
} from "../controllers/userController.js";
import upload from "../../lib/multerconfig.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/resendotp", resendOTP);
router.post("/validateotp", validateOTP);
router.post("/resetpassword", resetPassword);

export default router;

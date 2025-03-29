import bcrypt from "bcrypt";
import prisma from "../../lib/prismaclient.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendEmail.js";
import logUserActivity from "../helper/userActivityMoniter.js";

export const registerUser = async (req, res) => {
  try {
    const { email, firstName, lastName, password, gender, contactNumber } =
      req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //  const otp = Math.floor(100000 + Math.random() * 900000);
    //  const now = new Date();
    //  const otp_expire = new Date(now.getTime() + 3 * 60000);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        gender,
        contactNumber,
        avatar: avatar,
        // otp,
        // otp_expire,
      },
    });
    await logUserActivity(newUser.id, "User registered");

    return res.status(200).json({ message: "Registration Successful" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const tokenAge = 1000 * 60 * 60 * 24; // 1 day
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenAge / 1000 }
    );

    await prisma.user.update({
      where: { email: email },
      data: { sessionToken: token },
    });

    await logUserActivity(user.id, "User logged in");

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const logout = async (req, res) => {
//   const { id } = req.body;
//   try {
//     await prisma.user.update({
//       where: { id: id },
//       data: { sessionToken: null },
//     });
//     await logUserActivity(id, "User logged out");

//     res
//       .clearCookie("authToken")
//       .status(200)
//       .json({ message: "Logout sucssefuly" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };

export const logout = async (req, res) => {
  const { id } = req.body;
  try {
    await prisma.user.update({
      where: { id: id },
      data: { sessionToken: null },
    });
    await logUserActivity(id, "User logged out");

    res.clearCookie("authToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      domain: "localhost",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const user = prisma.user.findUnique({ email: email });
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const otp_expire = new Date(now.getTime() + 3 * 60000);
    await prisma.user.update({
      where: { email: email },
      data: { otp: otp, otp_expire: otp_expire },
    });
    await sendOtpEmail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to resend OTP", error: error.message });
  }
};

export const validateOTP = async (req, res) => {
  const { otp, email } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: " OTP are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp !== parseInt(otp) || new Date() > user.otp_expire) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await prisma.user.update({
      where: { email },
      data: { otp: null, otp_expire: null, password: "" },
    });
    await logUserActivity(user.id, "OTP validated");

    return res.status(200).json({ message: "OTP validated successfully" });
  } catch (error) {
    console.error("Error validating OTP:", error);
    return res
      .status(500)
      .json({ message: "Failed to validate OTP", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Password are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: email },
      data: { password: hashPassword },
    });
    await logUserActivity(user.id, "Password reset");

    return res.status(200).json({ message: "Reset password successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

import bcrypt from "bcrypt";
import prisma from "../../../../lib/prismaclient.js";

export const registerUser = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      gender,
      contactNumber,
      avatar,
    } = req.body;
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
      },
    });
    return res.status(200).json({ message: "User added Sucessfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req, res) => {
  const { id, firstName, lastName, gender, contactNumber, avatar } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      return res.status(404).json({ message: "unable to find the user" });
    }
    await prisma.user.update({
      where: { id: id },
      data: {
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        contactNumber: contactNumber,
        avatar: avatar,
      },
    });
    return res.status(200).json({ message: "User updated Sucessfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      return res.status(404).json({ message: "unable to find the user" });
    }
    await prisma.user.delete({
      where: { id: id },
    });
    return res.status(200).json({ message: "User deleted Sucessfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const setUserState = async (req, res) => {
  const { id, status } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { id: id, role: "user" },
    });
    if (!user) {
      return res.status(404).json({ message: "unable to find the user" });
    }
    await prisma.user.update({
      where: { id: id },
      data: {
        status: status,
      },
    });
    return res
      .status(200)
      .json({ message: "User Verification State Change Sucessfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "user" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        avatar: true,
        email: true,
        status: true,
        avatar: true,
        status: true,
      },
    });
    return res.status(200).json({ users: users });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getSingleStudents = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return res.status(400).json({ message: "Student ID is required" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: { role: "user", id: id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        avatar: true,
        email: true,
        status: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.status(200).json({ users: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

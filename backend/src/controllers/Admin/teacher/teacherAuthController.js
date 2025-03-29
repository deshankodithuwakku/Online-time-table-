import bcrypt from "bcrypt";
import prisma from "../../../../lib/prismaclient.js";

export const registerTeacher = async (req, res) => {
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
        role: "teacher",
        avatar: avatar,
      },
    });
    return res.status(200).json({ message: "User added Sucessfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateTeacher = async (req, res) => {
  const { id, firstName, lastName, avatar, gender, contactNumber } = req.body;
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

export const deleteTeacher = async (req, res) => {
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

export const setTeacherState = async (req, res) => {
  const { id, status } = req.body;
  console.log(req.body);
  try {
    const user = await prisma.user.findFirst({
      where: { id: id, role: "teacher" },
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

export const getAllTeachers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "teacher" },
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
    return res.status(200).json({ data: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSingleTeacher = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Techer's ID is required" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: { role: "teacher", id: id },
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
      return res.status(404).json({ message: "Techer's not found" });
    }
    return res.status(200).json({ users: user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

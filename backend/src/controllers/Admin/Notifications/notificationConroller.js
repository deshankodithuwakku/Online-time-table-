import prisma from "../../../../lib/prismaclient.js";

export const addNotification = async (req, res) => {
  const { title, message, recipientType } = req.body;

  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        recipientType,
      },
    });

    return res.status(200).json({ message: "Notification added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateNotification = async (req, res) => {
  const { id, title, message, recipientType } = req.body;

  try {
    await prisma.notification.update({
      where: { id: id },
      data: { title, message, recipientType },
    });

    return res
      .status(200)
      .json({ message: "Notification updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.notification.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany();
    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSingleNotification = async (req, res) => {
  const { id } = req.body;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTeacherAndAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ recipientType: "teacher" }, { recipientType: "all" }],
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getStudentAndAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ recipientType: "student" }, { recipientType: "all" }],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

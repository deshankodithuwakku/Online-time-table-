import prisma from "../../lib/prismaclient.js";

export const createNotification = async (title, message, recipientType) => {
  try {
    const notification = await prisma.notification.create({
      data: { title, message, recipientType },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

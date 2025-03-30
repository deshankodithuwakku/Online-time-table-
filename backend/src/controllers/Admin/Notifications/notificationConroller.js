import prisma from "../../../../lib/prismaclient.js";
import PDFDocument from "pdfkit";

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
    const { title, recipientType, startDate, endDate, download } = req.query;

    // Build the filter object
    const where = {};

    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    if (recipientType) {
      where.recipientType = recipientType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get the notifications with filters
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Handle PDF download
    if (download === "pdf") {
      try {
        const doc = new PDFDocument();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=notifications.pdf"
        );

        doc.pipe(res);

        // PDF Content
        doc.fontSize(20).text("Notifications Report", { align: "center" });
        doc.moveDown();

        notifications.forEach((notification, index) => {
          doc
            .fontSize(14)
            .text(`${index + 1}. ${notification.title}`, { underline: true });
          doc.fontSize(12).text(`Message: ${notification.message}`);
          doc.text(`Recipient Type: ${notification.recipientType}`);
          doc.text(`Date: ${notification.createdAt.toLocaleString()}`);
          doc.moveDown();
        });

        doc.end();
        return;
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        return res.status(500).json({ message: "Failed to generate PDF" });
      }
    }

    // Return JSON response
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
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

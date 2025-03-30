import prisma from "../../../../lib/prismaclient.js";
import PDFDocument from "pdfkit";

export const addNotice = async (req, res) => {
  const { title, message, recipientType } = req.body;

  try {
    await prisma.notice.create({
      data: {
        title,
        message,
        recipientType,
      },
    });

    return res.status(200).json({ message: "Notice added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateNotice = async (req, res) => {
  const { id, title, message, recipientType } = req.body;

  try {
    await prisma.notice.update({
      where: { id: id },
      data: { title, message, recipientType },
    });

    return res.status(200).json({ message: "Notice updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteNotice = async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.notice.delete({
      where: { id: id },
    });

    return res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getNotices = async (req, res) => {
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

    // Get the notices with filters
    const notices = await prisma.notice.findMany({
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
          "attachment; filename=notices.pdf"
        );

        doc.pipe(res);

        // PDF Content
        doc.fontSize(20).text("Notices Report", { align: "center" });
        doc.moveDown();

        notices.forEach((notice, index) => {
          doc
            .fontSize(14)
            .text(`${index + 1}. ${notice.title}`, { underline: true });
          doc.fontSize(12).text(`Message: ${notice.message}`);
          doc.text(`Recipient Type: ${notice.recipientType}`);
          doc.text(`Date: ${notice.createdAt.toLocaleString()}`);
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
    return res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSingleNotice = async (req, res) => {
  const { id } = req.body;

  try {
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    return res.status(200).json(notice);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

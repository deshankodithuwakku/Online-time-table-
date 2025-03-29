import prisma from "../../../../lib/prismaclient.js";
import { generatePDFReport } from "../../../utils/reportGenarator.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import { json2csv } from "json-2-csv";

export const userActivity = async (req, res) => {
  const { userId, startDate, endDate } = req.query;
  const filters = {};
  if (userId) {
    filters.userId = userId;
  }
  if (startDate && endDate) {
    filters.timestamp = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  const activities = await prisma.userActivity.findMany({
    where: filters,
    include: { user: true },
  });
  return res.status(200).json({ activities });
};

export const userActivityReprot = async (req, res) => {
  const { userId, startDate, endDate } = req.query;
  const filters = {};
  if (userId) {
    filters.userId = userId;
  }
  if (startDate && endDate) {
    filters.timestamp = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  const activities = await prisma.userActivity.findMany({
    where: filters,
    include: { user: true },
  });
  const filePath = "user_activity_report.pdf";
  await generatePDFReport(activities, filePath, "User Activity Re port");
};

export const getAllUserActivities = async (req, res) => {
  try {
    const { userId, startDate, endDate, download } = req.query;
    const filters = {};

    if (userId) {
      filters.userId = userId;
    }

    if (startDate && endDate) {
      filters.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const activities = await prisma.userActivity.findMany({
      where: filters,
      select: {
        id: true,
        activity: true,
        timestamp: true,
        userId: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Handle PDF download
    if (download === "pdf") {
      const doc = new PDFDocument();
      const filePath = `user_activities_${Date.now()}.pdf`;

      doc.pipe(fs.createWriteStream(filePath));
      doc.fontSize(20).text("User Activities Report", { align: "center" });
      doc.moveDown();

      activities.forEach((activity, index) => {
        doc
          .fontSize(12)
          .text(`${index + 1}. ${activity.activity}`, { continued: true })
          .text(` - ${new Date(activity.timestamp).toLocaleString()}`, {
            align: "right",
          });
        doc.moveDown();
      });

      doc.end();

      return res.download(filePath, () => {
        fs.unlinkSync(filePath); // Clean up after download
      });
    }

    // Handle CSV download
    if (download === "csv") {
      const csvData = activities.map((activity) => ({
        ID: activity.id,
        Activity: activity.activity,
        Timestamp: new Date(activity.timestamp).toLocaleString(),
        "User ID": activity.userId,
      }));

      const csv = json2csv.parse(csvData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=user_activities.csv"
      );
      return res.send(csv);
    }

    // Return JSON response for normal requests
    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

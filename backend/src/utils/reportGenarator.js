import PDFDocument from "pdfkit";
import fs from "fs";

export async function generatePDFReport(data, filePath, title) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown();

  data.forEach((entry) => {
    doc
      .fontSize(12)
      .text(`User: ${entry.user.firstName} ${entry.user.lastName}`);
    doc.text(`Activity: ${entry.activity}`);
    doc.text(`Timestamp: ${entry.timestamp}`);
    doc.moveDown();
  });

  doc.end();
}

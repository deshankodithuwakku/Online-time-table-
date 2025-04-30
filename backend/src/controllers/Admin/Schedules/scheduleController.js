import bcrypt from "bcrypt";
import prisma from "../../../../lib/prismaclient.js";
import PDFDocument from "pdfkit";

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

// export const getAllStudents = async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       where: { role: "user" },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         contactNumber: true,
//         avatar: true,
//         email: true,
//         status: true,
//         avatar: true,
//         status: true,
//       },
//     });
//     return res.status(200).json({ users: users });
//   } catch (error) {
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };

export const getAllStudents = async (req, res) => {
  try {
    const { download, firstName, lastName, email, contactNumber, status } =
      req.query;

    // Build the Prisma query conditions
    const whereConditions = { role: "user" };

    if (firstName) {
      whereConditions.firstName = {
        contains: firstName,
        mode: "insensitive",
      };
    }

    if (lastName) {
      whereConditions.lastName = {
        contains: lastName,
        mode: "insensitive",
      };
    }

    if (email) {
      whereConditions.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    if (contactNumber) {
      whereConditions.contactNumber = {
        contains: contactNumber,
      };
    }

    if (status) {
      whereConditions.status = status;
    }

    const students = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        avatar: true,
        email: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!students.length) {
      return res.status(404).json({
        message: "No students found matching your criteria",
      });
    }

    if (download === "pdf") {
      try {
        // PDF Configuration
        const doc = new PDFDocument({
          margin: 30,
          size: "A4",
          bufferPages: false, // Disabled to prevent extra pages
        });

        // Response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=students_${
            new Date().toISOString().split("T")[0]
          }.pdf`
        );

        doc.pipe(res);

        // Constants for layout
        const pageWidth = doc.page.width - 60; // Account for margins
        const startY = 50;
        let y = startY;
        const rowHeight = 25;
        const colWidths = [70, 130, 150, 110, 80]; // Adjusted column widths
        const cellPadding = 5;

        // Header
        doc.fontSize(16).text("Students Report", 50, y);
        y += 30;

        // Filters applied
        if (firstName || lastName || email || contactNumber || status) {
          doc.fontSize(10).text("Filters Applied:", 50, y);
          y += 15;

          const filters = [];
          if (firstName) filters.push(`First Name: ${firstName}`);
          if (lastName) filters.push(`Last Name: ${lastName}`);
          if (email) filters.push(`Email: ${email}`);
          if (contactNumber) filters.push(`Contact: ${contactNumber}`);
          if (status) filters.push(`Status: ${status}`);

          doc.text(filters.join(", "), 50, y, {
            width: pageWidth,
            lineGap: 5,
          });
          y += 30;
        }

        // Table Headers
        doc.font("Helvetica-Bold").fontSize(10);

        const headers = ["ID", "Name", "Email", "Contact", "Status"];
        headers.forEach((header, i) => {
          doc.text(
            header,
            50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + cellPadding,
            y + cellPadding,
            { width: colWidths[i] - cellPadding * 2 }
          );
        });
        y += rowHeight;

        // Horizontal line
        doc
          .moveTo(50, y)
          .lineTo(pageWidth + 50, y)
          .stroke();

        // Table Rows
        doc.font("Helvetica").fontSize(9);

        students.forEach((student) => {
          // Check for page break (leave 50px margin at bottom)
          if (y + rowHeight > doc.page.height - 50) {
            doc.addPage();
            y = startY;

            // Re-add headers on new page
            doc.font("Helvetica-Bold").fontSize(10);

            headers.forEach((header, i) => {
              doc.text(
                header,
                50 +
                  colWidths.slice(0, i).reduce((a, b) => a + b, 0) +
                  cellPadding,
                y + cellPadding,
                { width: colWidths[i] - cellPadding * 2 }
              );
            });
            y += rowHeight;

            doc
              .moveTo(50, y)
              .lineTo(pageWidth + 50, y)
              .stroke();

            doc.font("Helvetica").fontSize(9);
          }

          // ID (with increased width)
          doc.text(student.id.toString(), 50 + cellPadding, y + cellPadding, {
            width: colWidths[0] - cellPadding * 2,
          });

          // Name
          doc.text(
            `${student.firstName} ${student.lastName}`,
            50 + colWidths[0] + cellPadding,
            y + cellPadding,
            { width: colWidths[1] - cellPadding * 2 }
          );

          // Email (with ellipsis for overflow)
          doc.text(
            student.email,
            50 + colWidths[0] + colWidths[1] + cellPadding,
            y + cellPadding,
            {
              width: colWidths[2] - cellPadding * 2,
              ellipsis: true,
            }
          );

          // Contact
          doc.text(
            student.contactNumber || "N/A",
            50 + colWidths[0] + colWidths[1] + colWidths[2] + cellPadding,
            y + cellPadding,
            { width: colWidths[3] - cellPadding * 2 }
          );

          // Status
          doc.text(
            student.status.toUpperCase(),
            50 + colWidths.slice(0, 4).reduce((a, b) => a + b, 0) + cellPadding,
            y + cellPadding,
            {
              width: colWidths[4] - cellPadding * 2,
              align: "center",
            }
          );

          // Row divider
          y += rowHeight;
          doc
            .moveTo(50, y)
            .lineTo(pageWidth + 50, y)
            .lineWidth(0.5)
            .stroke();
        });

        // Final check for minimal content on last page
        const currentPage = doc.page;
        if (y < startY + 100) {
          // If last page has little content
          // Remove the last empty row divider
          currentPage.content.pop();
        }

        doc.end();
        return;
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        if (!res.headersSent) {
          return res.status(500).json({ message: "Failed to generate PDF" });
        }
      }
    }

    return res.status(200).json({
      users: students,
      filters: {
        firstName,
        lastName,
        email,
        contactNumber,
        status,
      },
    });
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
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

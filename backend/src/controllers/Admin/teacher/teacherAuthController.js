import bcrypt from "bcrypt";
import prisma from "../../../../lib/prismaclient.js";
import PDFDocument from "pdfkit";

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

// export const getAllTeachers = async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       where: { role: "teacher" },
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
//     return res.status(200).json({ data: users });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };
export const getAllTeachers = async (req, res) => {
  try {
    const { download, firstName, lastName, email, contactNumber, status } =
      req.query;

    // Build the Prisma query conditions
    const whereConditions = { role: "teacher" };

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

    const teachers = await prisma.user.findMany({
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

    if (!teachers.length) {
      return res.status(404).json({
        message: "No teachers found matching your criteria",
      });
    }

    // Handle PDF download
    if (download === "pdf") {
      try {
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=teachers_${
            new Date().toISOString().split("T")[0]
          }.pdf`
        );

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add title with filter info
        doc.fontSize(20).text("Teachers Report", { align: "center" });
        doc.moveDown();

        // Add filter information if any filters were applied
        let filterInfo = "All Teachers";
        if (firstName || lastName || email || contactNumber || status) {
          filterInfo = "Filtered Teachers: ";
          const filters = [];

          if (firstName) filters.push(`First Name: ${firstName}`);
          if (lastName) filters.push(`Last Name: ${lastName}`);
          if (email) filters.push(`Email: ${email}`);
          if (contactNumber) filters.push(`Contact: ${contactNumber}`);
          if (status) filters.push(`Status: ${status}`);

          filterInfo += filters.join(", ");
        }

        doc.fontSize(10).text(filterInfo, { align: "center" });
        doc.moveDown();

        // Add current date
        doc
          .fontSize(10)
          .text(`Generated on: ${new Date().toLocaleDateString()}`, {
            align: "right",
          });
        doc.moveDown(2);

        // Table setup
        const startY = doc.y;
        const colWidths = [70, 130, 150, 110, 80]; // ID, Name, Email, Contact, Status
        const rowHeight = 35;
        const cellPadding = 5;

        // Draw table headers
        doc.font("Helvetica-Bold").fontSize(10);

        const headers = ["ID", "Name", "Email", "Contact", "Status"];
        headers.forEach((header, i) => {
          doc.text(
            header,
            50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + cellPadding,
            startY + cellPadding,
            { width: colWidths[i] - cellPadding * 2 }
          );
        });

        // Draw line under headers
        doc
          .moveTo(50, startY + rowHeight)
          .lineTo(50 + colWidths.reduce((a, b) => a + b, 0), startY + rowHeight)
          .stroke();

        // Draw table rows
        doc.font("Helvetica").fontSize(9);

        let y = startY + rowHeight;

        teachers.forEach((teacher) => {
          // Check for page break
          if (y + rowHeight > doc.page.height - 50) {
            doc.addPage();
            y = 50;
            // Redraw headers on new page...
          }

          // ID
          doc.text(teacher.id.toString(), 50 + cellPadding, y + cellPadding, {
            width: colWidths[0] - cellPadding * 2,
          });

          // Name
          doc.text(
            `${teacher.firstName} ${teacher.lastName}`,
            50 + colWidths[0] + cellPadding,
            y + cellPadding,
            { width: colWidths[1] - cellPadding * 2 }
          );

          // Email
          doc.text(
            teacher.email,
            50 + colWidths[0] + colWidths[1] + cellPadding,
            y + cellPadding,
            { width: colWidths[2] - cellPadding * 2, ellipsis: true }
          );

          // Contact
          doc.text(
            teacher.contactNumber || "N/A",
            50 + colWidths[0] + colWidths[1] + colWidths[2] + cellPadding,
            y + cellPadding,
            { width: colWidths[3] - cellPadding * 2 }
          );

          // Status
          doc.text(
            teacher.status.toUpperCase(),
            50 + colWidths.slice(0, 4).reduce((a, b) => a + b, 0) + cellPadding,
            y + cellPadding,
            { width: colWidths[4] - cellPadding * 2, align: "center" }
          );

          // Move to next row
          y += rowHeight;
        });

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
      data: teachers,
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

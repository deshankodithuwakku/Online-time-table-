import prisma from "../../../../lib/prismaclient.js";
import PDFDocument from "pdfkit";

export const addCourse = async (req, res) => {
  const { name, description, teacherIds } = req.body;

  try {
    const course = await prisma.course.create({
      data: {
        name,
        description,
      },
    });

    const courseTeacherEntries = teacherIds.map((teacherId) => ({
      courseId: course.id,
      teacherId,
    }));

    await prisma.courseTeacher.createMany({
      data: courseTeacherEntries,
    });

    return res
      .status(200)
      .json({ data: course, message: "Course added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    await prisma.courseTeacher.deleteMany({
      where: { courseId },
    });

    await prisma.course.delete({
      where: { id: courseId },
    });

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc", // Alphabetical order by course name
      },
    });

    return res.status(200).json({
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error in getAllCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getCourse = async (req, res) => {
  const { id } = req.body;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    const teachers = await prisma.courseTeacher.findMany({
      where: {
        courseId: id,
      },
      select: {
        teacherId: true,
      },
    });
    const teacherIds = teachers.map((t) => t.teacherId);

    const teacherDetails = await prisma.user.findMany({
      where: {
        id: { in: teacherIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "Course retrieved successfully",
      data: {
        ...course,
        teachers: teacherDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({ message: "Failed to fetch course details" });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { name, description },
    });

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const generateCourseReport = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    const doc = new PDFDocument({ margin: 30 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=courses_report.pdf"
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text("Courses Report", { align: "center" });
    doc.moveDown();

    // Add current date
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleDateString()}`, {
        align: "right",
      });
    doc.moveDown(2);

    // Add table headers
    const headers = ["ID", "Name", "Description"];
    let y = doc.y;

    // Draw table headers
    doc.font("Helvetica-Bold");
    doc.fontSize(12);
    doc.text(headers[0], 50, y);
    doc.text(headers[1], 150, y);
    doc.text(headers[2], 300, y);
    doc.moveDown();

    // Draw table rows
    doc.font("Helvetica");
    courses.forEach((course) => {
      y = doc.y;
      if (y > 700) {
        // Add new page if we're at the bottom
        doc.addPage();
        y = 50;
      }

      doc.fontSize(10);
      doc.text(course.id, 50, y);
      doc.text(course.name, 150, y);
      doc.text(course.description || "N/A", 300, y);
      doc.moveDown();
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating course report:", error);
    return res.status(500).json({ message: "Failed to generate report" });
  }
};

export default getCourse;

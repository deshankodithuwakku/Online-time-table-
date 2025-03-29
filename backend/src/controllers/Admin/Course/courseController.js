import prisma from "../../../../lib/prismaclient.js";

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

// export const assignTeacher = async (req, res) => {
//   const { courseId, teacherId } = req.body;
//   try {
//     const courseassignment = await prisma.courseTeacher.findFirst({
//       where: {
//         courseId: courseId,
//         teacherId: teacherId,
//       },
//     });
//     if (courseassignment) {
//       return res
//         .status(404)
//         .json({ message: "Already teacher assigned to the course" });
//     }
//     const newAssignment = await prisma.courseTeacher.create({
//       data: {
//         courseId: courseId,
//         teacherId: teacherId,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Teacher assigned successfully",
//       data: newAssignment,
//     });
//   } catch (error) {
//     console.error("Error fetching course:", error);
//     return res.status(500).json({ message: "Failed to assign teacher" });
//   }
// };

export default getCourse;

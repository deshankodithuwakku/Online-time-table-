import prisma from "../../../../lib/prismaclient.js";

export const createScheduleRequest = async (req, res) => {
  const {
    teacherId,
    courseId,
    date,
    startTime,
    endTime,
    venue,
    duration,
    description,
  } = req.body;

  try {
    // Validate teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: "teacher" },
    });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create request
    const request = await prisma.scheduleRequest.create({
      data: {
        teacherId,
        courseId,
        date: new Date(date),
        startTime: new Date(`${date}T${startTime}:00Z`),
        endTime: new Date(`${date}T${endTime}:00Z`),
        venue,
        duration: parseInt(duration),
        description,
      },
    });

    return res.status(201).json({
      message: "Schedule request submitted successfully",
      request,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create schedule request" });
  }
};

export const getTeacherRequests = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const requests = await prisma.scheduleRequest.findMany({
      where: { teacherId },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// controllers/admin/scheduleController.js

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.scheduleRequest.findMany({
      where: { status: "pending" },
      include: {
        teacher: true,
        course: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to fetch pending requests" });
  }
};

export const processRequest = async (req, res) => {
  const { requestId, action } = req.body; // action: 'approve' or 'reject'

  try {
    const request = await prisma.scheduleRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (action === "approve") {
      // Check for conflicts
      const conflict = await prisma.schedules.findFirst({
        where: {
          date: request.date,
          venue: request.venue,
          AND: [
            { startTime: { lt: request.endTime } },
            { endTime: { gt: request.startTime } },
          ],
        },
      });

      if (conflict) {
        return res.status(409).json({
          message: "Time slot conflict exists",
          conflict,
        });
      }

      // Create the schedule
      const schedule = await prisma.schedules.create({
        data: {
          date: request.date,
          startTime: request.startTime,
          endTime: request.endTime,
          venue: request.venue,
          duration: request.duration,
          description: request.description,
          courseId: request.courseId,
          teacherId: request.teacherId,
        },
      });

      // Update request status
      await prisma.scheduleRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      });

      return res.status(200).json({
        message: "Schedule created successfully",
        schedule,
      });
    } else if (action === "reject") {
      await prisma.scheduleRequest.update({
        where: { id: requestId },
        data: { status: "rejected" },
      });

      return res.status(200).json({ message: "Request rejected" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to process request" });
  }
};

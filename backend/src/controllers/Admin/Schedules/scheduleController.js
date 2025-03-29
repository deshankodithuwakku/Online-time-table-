import prisma from "../../../../lib/prismaclient.js";
import { createNotification } from "../../../helper/createNotificationHelper.js";

export const addSchedule = async (req, res) => {
  const {
    courseId,
    date,
    startTime,
    endTime,
    venue,
    duration,
    description,
    teacherId,
    recipientType,
  } = req.body;
  console.log(req.body);
  const startDateTime = new Date(`${date}T${startTime}:00Z`).toISOString();
  const endDateTime = new Date(`${date}T${endTime}:00Z`).toISOString();

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isConflict = await prisma.schedules.findFirst({
      where: {
        date: new Date(date),
        venue: venue,
        AND: [
          { startTime: { lt: endDateTime } },
          { endTime: { gt: startDateTime } },
        ],
      },
    });

    if (isConflict) {
      return res
        .status(401)
        .json({ message: "Time slot has been scheduled early" });
    }

    const isTeacherAvailable = await prisma.assignedSchedule.findFirst({
      where: {
        userId: teacherId,
        schedule: {
          date: new Date(date),
          AND: [
            { startTime: { lt: endDateTime } },
            { endTime: { gt: startDateTime } },
          ],
        },
      },
    });

    if (isTeacherAvailable) {
      return res
        .status(400)
        .json({ message: "Teacher is already booked at this time" });
    }

    const newSchedule = await prisma.schedules.create({
      data: {
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        venue: venue,
        duration: parseInt(duration),
        description: description,
        course: { connect: { id: courseId } },
        teacher: { connect: { id: teacherId } },
      },
    });

    await prisma.assignedSchedule.create({
      data: {
        scheduleId: newSchedule.id,
        userId: teacherId,
      },
    });

    await createNotification(
      "Schedule Added",
      `Schedule to: Date: ${date} | Time: ${startTime}-${endTime} | Venue: ${venue}`,
      recipientType
    );

    return res.status(200).json({ message: "Successfully scheduled event" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteSchedule = async (req, res) => {
  const { id } = req.body;
  try {
    const schedule = await prisma.schedules.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    await prisma.assignedSchedule.deleteMany({
      where: {
        scheduleId: id,
      },
    });

    await prisma.schedules.delete({
      where: {
        id,
      },
    });

    return res
      .status(200)
      .json({ message: "Schedule and related records removed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const {
      id,
      date,
      startTime,
      endTime,
      venue,
      duration,
      description,
      recipientType,
    } = req.body;

    const schedule = await prisma.schedules.findUnique({ where: { id } });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule Not Found" });
    }
    const startDateTime = new Date(`${date}T${startTime}:00Z`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00Z`).toISOString();

    const isScheduleChanged =
      schedule.date.toISOString().split("T")[0] !== date ||
      schedule.startTime.toISOString() !== startDateTime ||
      schedule.endTime.toISOString() !== endDateTime ||
      schedule.venue !== venue;

    if (isScheduleChanged) {
      const isConflict = await prisma.schedules.findFirst({
        where: {
          date: new Date(date),
          venue: venue,
          NOT: { id }, // Exclude current schedule
          AND: [
            { startTime: { lt: endDateTime }, endTime: { gt: startDateTime } },
          ],
        },
      });

      if (isConflict) {
        return res.status(409).json({ message: "Time slot already scheduled" });
      }
    }

    const updatedSchedule = await prisma.schedules.update({
      where: { id },
      data: {
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        venue: venue,
        duration: parseInt(duration),
        description: description,
      },
    });

    await createNotification(
      "Schedule Updated",
      `Schedule details changed to: Date: ${date} | Time: ${startTime}-${endTime} | Venue: ${venue}`,
      recipientType
    );

    return res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedules.findMany({
      include: {
        course: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!schedules.length) {
      return res.status(404).json({ message: "No schedules found" });
    }
    return res.status(200).json({ data: schedules });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedules.findUnique({ where: { id } });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    return res.status(200).json({ data: schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const assignSchedule = async (req, res) => {
  const { id, courseName, assignedTeacherIds, recipientType } = req.body;
  try {
    const availableTeachers = await prisma.user.findMany({
      where: {
        role: "teacher",
        id: { notIn: assignedTeacherIds },
        assignedSchedules: {
          some: {
            schedule: {
              courseName: courseName,
            },
          },
        },
      },
      select: { id: true, firstName: true, lastName: true },
    });

    if (availableTeachers.length === 0) {
      return res
        .status(404)
        .json({ message: "No available teachers found for this course" });
    }

    const randomTeacher =
      availableTeachers[Math.floor(Math.random() * availableTeachers.length)];

    await prisma.assignedSchedule.create({
      data: {
        userId: randomTeacher.id,
        scheduleId: id,
      },
    });
    await createNotification(
      `${courseName} has been scheduled`,
      `Date: ${date} | Time: ${startTime} - ${endTime} | Venue: ${venue}`,
      recipientType
    );

    return res.status(200).json({
      message: "New teacher assigned successfully",
      teacher: randomTeacher,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const reassignSchedule = async (req, res) => {
  const { scheduleId, recipientType } = req.body;

  try {
    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
      include: { course: true },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const currentAssignment = await prisma.assignedSchedule.findFirst({
      where: { scheduleId: scheduleId },
      include: { user: true },
    });

    if (!currentAssignment) {
      return res
        .status(404)
        .json({ message: "No teacher assigned to this schedule" });
    }

    const currentTeacherId = currentAssignment.userId;

    const subjectIds = await prisma.courseTeacher.findMany({
      where: { teacherId: currentTeacherId },
      select: { courseId: true },
    });

    const subjectIdList = subjectIds.map((c) => c.courseId);

    const availableTeacher = await prisma.user.findFirst({
      where: {
        role: "teacher",
        id: { not: currentTeacherId },
        CourseTeacher: { some: { courseId: { in: subjectIdList } } },
        assignedSchedules: {
          none: {
            schedule: {
              date: schedule.date,
              AND: [
                { startTime: { lt: schedule.endTime } },
                { endTime: { gt: schedule.startTime } },
              ],
            },
          },
        },
      },
    });
    console.log(availableTeacher);

    if (!availableTeacher) {
      return res
        .status(404)
        .json({ message: "No available teacher found for this subject" });
    }

    await prisma.assignedSchedule.updateMany({
      where: {
        scheduleId: scheduleId,
        userId: currentTeacherId,
      },
      data: { userId: availableTeacher.id },
    });

    await createNotification(
      `Schedule Updated: ${schedule.courseName}`,
      `New Teacher: ${availableTeacher.firstName} ${availableTeacher.lastName}\n
       Date: ${schedule.date} | Time: ${schedule.startTime} - ${schedule.endTime} | Venue: ${schedule.venue}`,
      recipientType
    );

    return res.status(200).json({
      message: "Teacher reassigned successfully",
      newTeacher: {
        id: availableTeacher.id,
        name: `${availableTeacher.firstName} ${availableTeacher.lastName}`,
      },
    });
  } catch (error) {
    console.error("Error reassigning teacher:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

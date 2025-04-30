import prisma from "../../../../lib/prismaclient.js";
import { createNotification } from "../../../helper/createNotificationHelper.js";
import PDFDocument from "pdfkit";

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
        .status(409)
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

// export const getAllSchedules = async (req, res) => {
//   try {
//     const { download } = req.query;

//     const schedules = await prisma.schedules.findMany({
//       include: {
//         course: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });

//     if (!schedules.length) {
//       return res.status(404).json({ message: "No schedules found" });
//     }

//     // Handle PDF download
//     if (download === "pdf") {
//       try {
//         const doc = new PDFDocument({ margin: 30 });

//         // Set response headers
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader(
//           "Content-Disposition",
//           "attachment; filename=schedules.pdf"
//         );

//         // Pipe the PDF to the response
//         doc.pipe(res);

//         // Add title
//         doc.fontSize(20).text("Schedules Report", { align: "center" });
//         doc.moveDown();

//         // Add current date
//         doc
//           .fontSize(10)
//           .text(`Generated on: ${new Date().toLocaleDateString()}`, {
//             align: "right",
//           });
//         doc.moveDown(2);

//         // Add table headers
//         const headers = [
//           "Course",
//           "Date",
//           "Start Time",
//           "End Time",
//           "Venue",
//           "Duration",
//         ];
//         let y = doc.y;

//         // Draw table headers
//         doc.font("Helvetica-Bold");
//         doc.fontSize(12);
//         doc.text(headers[0], 50, y);
//         doc.text(headers[1], 150, y);
//         doc.text(headers[2], 230, y);
//         doc.text(headers[3], 300, y);
//         doc.text(headers[4], 370, y);
//         doc.text(headers[5], 470, y);
//         doc.moveDown();

//         // Draw table rows
//         doc.font("Helvetica");
//         schedules.forEach((schedule) => {
//           y = doc.y;
//           if (y > 700) {
//             // Add new page if we're at the bottom
//             doc.addPage();
//             y = 50;
//           }

//           // Convert dates to proper format
//           const scheduleDate = new Date(schedule.date);
//           const startTime = new Date(schedule.startTime);
//           const endTime = new Date(schedule.endTime);

//           doc.fontSize(10);
//           doc.text(schedule.course?.name || "N/A", 50, y);
//           doc.text(scheduleDate.toLocaleDateString(), 150, y);
//           doc.text(
//             startTime.toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             230,
//             y
//           );
//           doc.text(
//             endTime.toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             300,
//             y
//           );
//           doc.text(schedule.venue, 370, y);
//           doc.text(`${schedule.duration} mins`, 470, y);
//           doc.moveDown();

//           // Add description if exists
//           if (schedule.description) {
//             doc
//               .fontSize(8)
//               .text(`Description: ${schedule.description}`, 50, doc.y, {
//                 width: 500,
//                 align: "left",
//               });
//             doc.moveDown();
//           }
//         });

//         // Finalize the PDF
//         doc.end();
//         return;
//       } catch (pdfError) {
//         console.error("PDF generation error:", pdfError);
//         // Make sure we don't try to send multiple responses
//         if (!res.headersSent) {
//           return res.status(500).json({ message: "Failed to generate PDF" });
//         }
//       }
//     }

//     // Return JSON response if not downloading PDF
//     return res.status(200).json({ data: schedules });
//   } catch (error) {
//     console.log(error);
//     // Make sure we don't try to send multiple responses
//     if (!res.headersSent) {
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// };
export const getAllSchedules = async (req, res) => {
  try {
    const { download, courseName, venue, startDate, endDate } = req.query;

    // Build the Prisma query conditions
    const whereConditions = {};

    if (courseName) {
      whereConditions.course = {
        name: {
          contains: courseName,
          mode: "insensitive",
        },
      };
    }

    if (venue) {
      whereConditions.venue = {
        contains: venue,
        mode: "insensitive",
      };
    }

    if (startDate && endDate) {
      whereConditions.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereConditions.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereConditions.date = {
        lte: new Date(endDate),
      };
    }

    const schedules = await prisma.schedules.findMany({
      where: whereConditions,
      include: {
        course: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    if (!schedules.length) {
      return res.status(404).json({
        message: "No schedules found matching your criteria",
      });
    }

    // Handle PDF download
    if (download === "pdf") {
      try {
        const doc = new PDFDocument({ margin: 30 });

        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=schedules_${
            new Date().toISOString().split("T")[0]
          }.pdf`
        );

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add title with filter info
        doc.fontSize(20).text("Schedules Report", { align: "center" });
        doc.moveDown();

        // Add filter information if any filters were applied
        let filterInfo = "All Schedules";
        if (courseName || venue || startDate || endDate) {
          filterInfo = "Filtered Schedules: ";
          const filters = [];

          if (courseName) filters.push(`Course: ${courseName}`);
          if (venue) filters.push(`Venue: ${venue}`);
          if (startDate)
            filters.push(`From: ${new Date(startDate).toLocaleDateString()}`);
          if (endDate)
            filters.push(`To: ${new Date(endDate).toLocaleDateString()}`);

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

        // Add table headers
        const headers = [
          "Course",
          "Teacher",
          "Date",
          "Start Time",
          "End Time",
          "Venue",
          "Duration",
        ];
        let y = doc.y;

        // Draw table headers
        doc.font("Helvetica-Bold");
        doc.fontSize(10);
        doc.text(headers[0], 50, y);
        doc.text(headers[1], 130, y);
        doc.text(headers[2], 200, y);
        doc.text(headers[3], 260, y);
        doc.text(headers[4], 320, y);
        doc.text(headers[5], 380, y);
        doc.text(headers[6], 450, y);
        doc.moveDown();

        // Draw table rows
        doc.font("Helvetica");
        schedules.forEach((schedule) => {
          y = doc.y;
          if (y > 700) {
            // Add new page if we're at the bottom
            doc.addPage();
            y = 50;
          }

          // Convert dates to proper format
          const scheduleDate = new Date(schedule.date);
          const startTime = new Date(schedule.startTime);
          const endTime = new Date(schedule.endTime);

          doc.fontSize(9);
          doc.text(schedule.course?.name || "N/A", 50, y, { width: 70 });
          doc.text(
            `${schedule.teacher?.firstName || ""} ${
              schedule.teacher?.lastName || ""
            }`,
            130,
            y,
            { width: 60 }
          );
          doc.text(scheduleDate.toLocaleDateString(), 200, y, { width: 60 });
          doc.text(
            startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            260,
            y,
            { width: 50 }
          );
          doc.text(
            endTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            320,
            y,
            { width: 50 }
          );
          doc.text(schedule.venue, 380, y, { width: 70 });
          doc.text(`${schedule.duration} mins`, 450, y, { width: 50 });
          doc.moveDown();

          // Add description if exists
          if (schedule.description) {
            doc
              .fontSize(8)
              .text(`Description: ${schedule.description}`, 50, doc.y, {
                width: 500,
                align: "left",
              });
            doc.moveDown();
          }
        });

        // Finalize the PDF
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
      data: schedules,
      filters: {
        courseName,
        venue,
        startDate,
        endDate,
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

export const getTeacherSchedules = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (teacher.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    const schedules = await prisma.schedules.findMany({
      where: {
        OR: [
          { teacherId: id },
          {
            assignedExaminers: {
              some: {
                userId: id,
              },
            },
          },
        ],
      },
      include: {
        course: {
          select: {
            name: true,
            description: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignedExaminers: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Map the schedules to include the ID in a more accessible way if needed
    const schedulesWithId = schedules.map((schedule) => ({
      ...schedule,
      scheduleId: schedule.id, // Adding explicit scheduleId field
    }));

    return res.status(200).json({
      message: "Teacher schedules retrieved successfully",
      data: schedulesWithId || [],
    });
  } catch (error) {
    console.error("Error fetching teacher schedules:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const cancelAndReassignSchedule = async (req, res) => {
  const { scheduleId } = req.body;

  try {
    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
      include: {
        course: true,
        teacher: true,
        assignedExaminers: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const currentTeacherId = schedule.teacherId;
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

    if (availableTeacher) {
      await prisma.schedules.update({
        where: { id: scheduleId },
        data: { teacherId: availableTeacher.id },
      });

      if (schedule.assignedExaminers.length > 0) {
        await prisma.assignedSchedule.updateMany({
          where: { scheduleId: scheduleId },
          data: { userId: availableTeacher.id },
        });
      }
      await prisma.notification.create({
        data: {
          title: `Schedule Updated: ${schedule.course.name}`,
          message: `New Teacher: ${availableTeacher.firstName} ${
            availableTeacher.lastName
          }\n
                   Date: ${schedule.date.toLocaleDateString()} | Time: ${schedule.startTime.toLocaleTimeString()} - ${schedule.endTime.toLocaleTimeString()} | Venue: ${
            schedule.venue
          }`,
          recipientType: "all",
        },
      });

      return res.status(200).json({
        message: "Schedule reassigned successfully",
        newTeacher: {
          id: availableTeacher.id,
          name: `${availableTeacher.firstName} ${availableTeacher.lastName}`,
        },
        action: "reassigned",
      });
    } else {
      if (schedule.assignedExaminers.length > 0) {
        await prisma.assignedSchedule.deleteMany({
          where: { scheduleId: scheduleId },
        });
      }

      await prisma.schedules.delete({
        where: { id: scheduleId },
      });

      return res.status(200).json({
        message: "No available teacher found - schedule deleted",
        action: "deleted",
      });
    }
  } catch (error) {
    console.error("Error in cancelAndReassignSchedule:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

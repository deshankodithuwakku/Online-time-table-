import prisma from "../../../../lib/prismaclient.js";

// Helper function for standardized error responses
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

// Validation function for notice data
const validateNoticeData = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.hasOwnProperty("title")) {
    if (!data?.title || data.title.trim() === "") {
      errors.push({ field: "title", message: "Title is required" });
    } else if (data.title.length > 100) {
      errors.push({
        field: "title",
        message: "Title must be less than 100 characters",
      });
    }
  }

  if (!isUpdate || data.hasOwnProperty("content")) {
    if (!data?.content || data.content.trim() === "") {
      errors.push({ field: "content", message: "Content is required" });
    } else if (data.content.length > 2000) {
      errors.push({
        field: "content",
        message: "Content must be less than 2000 characters",
      });
    }
  }

  if (!isUpdate || data.hasOwnProperty("noticeDate")) {
    if (!data?.noticeDate) {
      errors.push({ field: "noticeDate", message: "Date is required" });
    } else if (isNaN(new Date(data.noticeDate))) {
      errors.push({ field: "noticeDate", message: "Invalid date format" });
    }
  }

  if (!isUpdate || data.hasOwnProperty("priority")) {
    const validPriorities = ["low", "medium", "high"];
    if (data?.priority && !validPriorities.includes(data.priority)) {
      errors.push({ field: "priority", message: "Invalid priority value" });
    }
  }

  if (!isUpdate || data.hasOwnProperty("status")) {
    const validStatuses = ["active", "inactive", "archived"];
    if (data?.status && !validStatuses.includes(data.status)) {
      errors.push({ field: "status", message: "Invalid status value" });
    }
  }

  return errors;
};

/**
 * @desc    Create a new notice
 * @route   POST /api/admin/addnotice
 * @access  Private/Admin
 */
export const addNotice = async (req, res) => {
  try {
    // Validate request body
    const validationErrors = validateNoticeData(req.body);
    if (validationErrors.length > 0) {
      return errorResponse(res, 400, "Validation failed", validationErrors);
    }

    const { title, content, noticeDate, priority, status } = req.body;

    // Check for duplicate title (case insensitive)
    const existingNotice = await prisma.notice.findFirst({
      where: {
        title: { equals: title, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (existingNotice) {
      return errorResponse(res, 409, "A notice with this title already exists");
    }

    // Create notice in database
    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
        noticeDate: new Date(noticeDate),
        priority,
        status,
        createdBy: req.user?.id || "system",
      },
      select: {
        id: true,
        title: true,
        noticeDate: true,
        priority: true,
        status: true,
        createdAt: true,
        createdBy: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: newNotice,
    });
  } catch (error) {
    console.error("[NOTICE CONTROLLER ERROR]", error);

    // Handle Prisma errors
    if (error.name === "PrismaClientKnownRequestError") {
      if (error.code === "P2002") {
        return errorResponse(res, 409, "Database conflict: Duplicate entry");
      }
      return errorResponse(res, 500, "Database operation failed");
    }

    // Handle other errors
    return errorResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc    Get all notices with pagination and filtering
 * @route   GET /api/admin/getallnotices
 * @access  Private/Admin
 */
export const getAllNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, priority } = req.query;
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
      deletedAt: null,
    };

    const [notices, totalCount] = await Promise.all([
      prisma.notice.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { noticeDate: "desc" },
        select: {
          id: true,
          title: true,
          noticeDate: true,
          priority: true,
          status: true,
          createdAt: true,
          createdBy: true,
        },
      }),
      prisma.notice.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      data: notices,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[NOTICE CONTROLLER ERROR]", error);
    return errorResponse(res, 500, "Failed to fetch notices");
  }
};

/**
 * @desc    Get single notice by ID
 * @route   GET /api/admin/getnotice/:id
 * @access  Private/Admin
 */
export const getSingleNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        noticeDate: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    if (!notice) {
      return errorResponse(res, 404, "Notice not found");
    }

    return res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error("[NOTICE CONTROLLER ERROR]", error);
    return errorResponse(res, 500, "Failed to fetch notice");
  }
};

/**
 * @desc    Update a notice
 * @route   PUT /api/admin/updatenotice
 * @access  Private/Admin
 */
export const updateNotice = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Validate update data
    const validationErrors = validateNoticeData(updateData, true);
    if (validationErrors.length > 0) {
      return errorResponse(res, 400, "Validation failed", validationErrors);
    }

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingNotice) {
      return errorResponse(res, 404, "Notice not found");
    }

    // Prepare update data
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.noticeDate) {
      dataToUpdate.noticeDate = new Date(dataToUpdate.noticeDate);
    }

    // Update notice
    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: {
        ...dataToUpdate,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        noticeDate: true,
        priority: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: updatedNotice,
    });
  } catch (error) {
    console.error("[NOTICE CONTROLLER ERROR]", error);

    if (error instanceof prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(
          res,
          409,
          "A notice with this title already exists"
        );
      }
      return errorResponse(res, 500, "Database operation failed");
    }

    return errorResponse(res, 500, "Failed to update notice");
  }
};

/**
 * @desc    Delete a notice (soft delete)
 * @route   DELETE /api/admin/deletenotice
 * @access  Private/Admin
 */
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingNotice) {
      return errorResponse(res, 404, "Notice not found");
    }

    // Soft delete the notice
    await prisma.notice.update({
      where: { id },
      data: {
        status: "archived",
        deletedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("[NOTICE CONTROLLER ERROR]", error);
    return errorResponse(res, 500, "Failed to delete notice");
  }
};

/**
 * @desc    Restore a soft-deleted notice
 * @route   POST /api/admin/restorenotice
 * @access  Private/Admin
 */
export const restoreNotice = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if notice exists (including soft-deleted)
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existingNotice) {
      return errorResponse(res, 404, "Notice not found");
    }

    if (!existingNotice.deletedAt) {
      return errorResponse(res, 400, "Notice is not deleted");
    }

    // Restore the notice
    const restoredNotice = await prisma.notice.update({
      where: { id },
      data: {
        status: "active",
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notice restored successfully",
      data: restoredNotice,
    });
  } catch (error) {
    console.error("[NOTICE CONTROLLER ERROR]", error);
    return errorResponse(res, 500, "Failed to restore notice");
  }
};

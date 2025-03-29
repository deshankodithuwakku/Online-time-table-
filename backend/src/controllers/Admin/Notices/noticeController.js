import prisma from "../../../../lib/prismaclient.js";

export const addNotice = async (req, res) => {
  const { title, content } = req.body;

  try {
    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
      },
    });

    return res.status(200).json({ message: "Notice added successfully", notice: newNotice });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateNotice = async (req, res) => {
  const { id, title, content } = req.body;

  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: { title, content },
    });

    return res.status(200).json({ message: "Notice updated successfully", notice: updatedNotice });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteNotice = async (req, res) => {
  const { id } = req.body;

  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    await prisma.notice.delete({ where: { id } });

    return res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json(notices);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSingleNotice = async (req, res) => {
  const { id } = req.body;

  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    return res.status(200).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

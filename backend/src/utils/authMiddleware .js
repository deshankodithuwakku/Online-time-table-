import jwt from "jsonwebtoken";
import prisma from "../../lib/prismaclient.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.sessionToken !== token) {
      return res
        .status(403)
        .json({ message: "Session expired, please log in again" });
    }

    // if (user.role !== "admin") {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

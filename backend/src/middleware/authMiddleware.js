// import prisma from "../../lib/prismaclient.js";
// import jwt from "jsonwebtoken";

// export const verifyToken = async (req, res, next) => {
//   try {
//     const token =
//       req.cookies.authToken || req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//       select: { id: true, email: true, sessionToken: true },
//     });

//     if (!user || user.sessionToken !== token) {
//       return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }

//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Token verification error:", error);
//     if (error.name === "TokenExpiredError") {
//       return res
//         .status(401)
//         .json({ message: "Session expired. Please login again." });
//     }
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       return res.status(500).json({ message: "Database error" });
//     }
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };

import prisma from "../../lib/prismaclient.js";
import jwt from "jsonwebtoken";

export const verifyToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token =
        req.cookies.authToken || req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          sessionToken: true,
          role: true,
        },
      });

      if (!user || user.sessionToken !== token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      // Check if user has the required role if allowedRoles is specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res
          .status(401)
          .json({ message: "Forbidden: Insufficient permissions" });
      }

      req.user = {
        ...decoded,
        role: user.role, // Attach role to the request object
      };
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Session expired. Please login again." });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      if (error) {
        return res.status(500).json({ message: "Database error" });
      }
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

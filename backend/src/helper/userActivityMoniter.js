import prisma from "../../lib/prismaclient.js";

const logUserActivity = async (userId, activity) => {
  await prisma.userActivity.create({
    data: {
      userId,
      activity,
    },
  });
};

export default logUserActivity;

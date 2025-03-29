import express from "express";
import {
  deleteUser,
  getAllStudents,
  getSingleStudents,
  registerUser,
  setUserState,
  updateUser,
} from "../controllers/Admin/Student/studentAuthController.js";
import {
  deleteTeacher,
  getAllTeachers,
  getSingleTeacher,
  registerTeacher,
  setTeacherState,
  updateTeacher,
} from "../controllers/Admin/teacher/teacherAuthController.js";
import {
  addSchedule,
  deleteSchedule,
  getAllSchedules,
  getSingleSchedule,
  reassignSchedule,
  updateSchedule,
} from "../controllers/Admin/Schedules/scheduleController.js";
import {
  addNotification,
  deleteNotification,
  getNotifications,
  getSingleNotification,
  getStudentAndAllNotifications,
  getTeacherAndAllNotifications,
  updateNotification,
} from "../controllers/Admin/Notifications/notificationConroller.js";
import getCourse, {
  addCourse,
  // assignTeacher,
  deleteCourse,
  getAllCourses,
} from "../controllers/Admin/Course/courseController.js";
import {
  getAllUserActivities,
  userActivity,
  userActivityReprot,
} from "../controllers/Admin/Reports/reportController.js";
import upload from "../../lib/multerconfig.js";
import { authMiddleware } from "../utils/authMiddleware .js";
import {
  createScheduleRequest,
  getPendingRequests,
  getTeacherRequests,
  processRequest,
} from "../controllers/Admin/Request/teacherRequstController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.use(authMiddleware);
// router.use(verifyToken);

//Route For User Authentication and User Management
router.post(
  "/adduser",
  upload.single("avatar"),
  verifyToken(["admin"]),
  registerUser
);
router.post("/updateuser", verifyToken(["admin"]), updateUser);
router.post("/deleteuser", verifyToken(["admin"]), deleteUser);
// router.post("/deleteuser", deleteUser);
router.post("/verifyuser", verifyToken(["admin"]), setUserState);

router.get("/getallusers", verifyToken(["admin"]), getAllStudents);
router.get("/getuser/:id", verifyToken(["admin"]), getSingleStudents);

//Route For Teacher Authentication and Teacher Management
router.post(
  "/addteacher",
  verifyToken(["admin"]),
  upload.single("avatar"),
  registerTeacher
);
router.post("/updateteacher", verifyToken(["admin"]), updateTeacher);
router.post("/deleteteacher", verifyToken(["admin"]), deleteTeacher);
router.post("/verifyteacher", verifyToken(["admin"]), setTeacherState);

router.get("/getallteachers", verifyToken(["admin"]), getAllTeachers);
router.get("/getteacher/:id", verifyToken(["admin"]), getSingleTeacher);

//Route For Schedule Authentication and Schedule Management
router.post("/addschedule", verifyToken(["admin"]), addSchedule);
router.post("/deleteschedule", verifyToken(["admin"]), deleteSchedule);
router.post("/updateschedule", verifyToken(["admin"]), updateSchedule);
router.post("/reassignschedule", verifyToken(["admin"]), reassignSchedule);

router.get("/getallschedule", getAllSchedules);
router.get("/getsingleschedule/:id", verifyToken(["admin"]), getSingleSchedule);

//Route For Notification Authentication and Notification Management
router.post("/addnotification", verifyToken(["admin"]), addNotification);
router.post("/updatenotification", verifyToken(["admin"]), updateNotification);
router.post("/deleteNotification", verifyToken(["admin"]), deleteNotification);

router.get("/getallNotification", verifyToken(["admin"]), getNotifications);
router.post("/getnotification", verifyToken(["admin"]), getSingleNotification);
router.get(
  "/getteachernotifiation",
  verifyToken(["teacher"]),
  getTeacherAndAllNotifications
);
router.get(
  "/getusernotifiation",
  verifyToken(["user"]),
  getStudentAndAllNotifications
);

//Route For Course Authentication and Course Management
router.post("/addcourse", verifyToken(["admin"]), addCourse);
router.post("/deletecourse", verifyToken(["admin"]), deleteCourse);
router.get("/allcourses", verifyToken(["admin", "teacher"]), getAllCourses);
router.post("/getcoursedetails", verifyToken(["admin"]), getCourse);
// router.post("/assignteacher", assignTeacher);

//Route For Reports Management
router.post("/useractivity", verifyToken(["admin"]), userActivity);
router.post("/useractivityreports", verifyToken(["admin"]), userActivityReprot);
router.get("/allusersactivitys", verifyToken(["admin"]), getAllUserActivities);

//Request Routes
router.post(
  "/createschedulerequest",
  verifyToken(["teacher"]),
  createScheduleRequest
);
router.get(
  "/getteacherrequests/:id",
  verifyToken(["teacher"]),
  getTeacherRequests
);
router.get("/getpendingrequests", verifyToken(["admin"]), getPendingRequests);
router.post("/processrequest", verifyToken(["admin"]), processRequest);

export default router;

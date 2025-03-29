import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";

import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import ResendOTPForm from "./pages/ResendotpForm";
import ValidateOTP from "./pages/OtpvalidatePage";
import ResetPassword from "./pages/ResetpasswordPage";
import Teacherprofile from "./pages/Teacherprofile";
import Userprofile from "./pages/Userprofile";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashbord";
import UsersTable from "./components/Usertable";
import { ToastContainer } from "react-toastify";
import TeachersTable from "./components/Teachertable";
import AddScheduleForm from "./pages/AddscheduleForm";
import ScheduleTable from "./components/Scheduletable";
import AssignScheduleForm from "./pages/Teacherassign";
import Singleschdulepage from "./pages/Singleschdulepage";
import CoursesTable from "./components/Coursetable";
import CourseProfilePage from "./pages/CourseProfilePage";
import NotificationsTable from "./components/NotificationsTable";
import NotificationProfilePage from "./pages/NotificationProfilePage";
import UserActivitiesTable from "./components/UserActivitiesTable";
import Requesttable from "./components/Requesttable";

const App = () => {
  return (
    <Router>
      <MainContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

const MainContent = () => {
  const location = useLocation();
  const authRoutes = [
    "/login",
    "/register",
    "/resendotp",
    "/validateotp",
    "/resetpassword",
  ];

  return (
    <div className="flex h-screen">
      {!authRoutes.includes(location.pathname) && <Sidebar />}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usertable" element={<UsersTable />} />
          <Route path="/teachertable" element={<TeachersTable />} />
          <Route path="/scheuletable" element={<ScheduleTable />} />
          <Route path="/coursetable" element={<CoursesTable />} />
          <Route path="/notificationtable" element={<NotificationsTable />} />
          <Route path="/activitytable" element={<UserActivitiesTable />} />
          <Route path="/requesttable" element={<Requesttable />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/resendotp" element={<ResendOTPForm />} />
          <Route path="/validateotp" element={<ValidateOTP />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/userprofile/:id" element={<Userprofile />} />
          <Route path="/teacherprofile/:id" element={<Teacherprofile />} />
          <Route path="/schuledetails/:id" element={<Singleschdulepage />} />
          <Route path="/coursedetails/:id" element={<CourseProfilePage />} />
          <Route
            path="/notificationdetails/:id"
            element={<NotificationProfilePage />}
          />
          <Route path="/addschecule" element={<AddScheduleForm />} />
          <Route path="/assignschecule" element={<AssignScheduleForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

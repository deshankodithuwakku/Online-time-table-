import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import NotificationsPage from "./components/NotificationsPage";
import LoginForm from "./pages/login";
import RegisterForm from "./pages/register";
import ResendOTPForm from "./pages/Passwordrest";
import OtpValidation from "./pages/OtpValidation";
import PasswordrestPage from "./pages/PasswordrestPage";
import TeacherRequestForm from "./pages/TeacherRequestForm";
import RequestHistory from "./pages/RequestHistory";
import Studentnotification from "./pages/Studentnotification";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <Router>
      <MainContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

const MainContent = () => {
  const location = useLocation();
  const authRoutes = [
    "/login",
    "/register",
    "/resendotp",
    "/validateotp",
    "/resetpassword",
    "/forgotpassword",
  ];

  return (
    <div className="flex h-screen">
      {!authRoutes.includes(location.pathname) && <Sidebar />}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgotpassword" element={<ResendOTPForm />} />
          <Route path="/validateotp" element={<OtpValidation />} />
          <Route path="/resetpassword" element={<PasswordrestPage />} />
          <Route
            path="/studentnotifications"
            element={<Studentnotification />}
          />

          {/* Protected Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requestschedule"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherRequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requestshistory"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <RequestHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;

import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("userId"));

  if (!user) {
    toast.error("Please login first");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

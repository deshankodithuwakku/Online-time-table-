import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaUsers } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { IoNotificationsSharp } from "react-icons/io5";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userId") || {});
  const userRole = userData?.role; // 'teacher', 'student', etc.

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userId"));
      const userId = userData?.userId;

      if (!userId) {
        console.error("No user ID found in localStorage");
        return;
      }

      const response = await fetch("http://localhost:8080/api/user/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (response.ok) {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-center py-6 border-b border-gray-700">
        <h2 className="text-3xl font-semibold text-indigo-500">Dashboard</h2>
      </div>
      <nav className="mt-6">
        <ul>
          {/* Dashboard Link - Always visible */}
          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out">
            <Link to="/" className="flex items-center p-3 hover:text-white">
              <FaTachometerAlt className="mr-3 text-xl" />
              <span className="text-lg">Dashboard</span>
            </Link>
          </li>
          {userRole === "user" && (
            <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out">
              <Link
                to="/studentnotifications"
                className="flex items-center p-3 hover:text-white"
              >
                <IoNotificationsSharp className="mr-3 text-xl" />
                <span className="text-lg">Notification</span>
              </Link>
            </li>
          )}
          {/* Protected Routes - Only for teachers */}
          {userRole === "teacher" && (
            <>
              <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out">
                <Link
                  to="/requestschedule"
                  className="flex items-center p-3 hover:text-white"
                >
                  <BiMessageRoundedDetail className="mr-3 text-xl" />
                  <span className="text-lg">Schedule</span>
                </Link>
              </li>
              <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out">
                <Link
                  to="/requestshistory"
                  className="flex items-center p-3 hover:text-white"
                >
                  <GrHistory className="mr-3 text-xl" />
                  <span className="text-lg">Request History</span>
                </Link>
              </li>
              <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out">
                <Link
                  to="/notifications"
                  className="flex items-center p-3 hover:text-white"
                >
                  <IoNotificationsSharp className="mr-3 text-xl" />
                  <span className="text-lg">Notification</span>
                </Link>
              </li>
            </>
          )}

          {/* Logout - Always visible */}
          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <button
              onClick={handleLogout}
              className="flex items-center p-3 w-full text-left hover:text-white"
            >
              <RiLogoutBoxRLine className="mr-3 text-xl" />
              <span className="text-lg">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

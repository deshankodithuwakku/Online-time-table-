import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaChevronDown } from "react-icons/fa";
import { GiTeacher } from "react-icons/gi";
import { AiOutlineSchedule } from "react-icons/ai";
import { FiBook } from "react-icons/fi";
import { IoNotificationsSharp } from "react-icons/io5";
import { LuNewspaper } from "react-icons/lu";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userId"));
      const userId = userData.userId;

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
        // Clear user data from localStorage

        localStorage.removeItem("userId"); // Remove by the correct key name
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="h-full w-64 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-center py-6 border-b border-gray-700">
        <h2 className="text-3xl font-semibold text-indigo-500">
          Admin Dashboard
        </h2>
      </div>
      <nav className="mt-6">
        <ul className="space-y-1">
          {/* Dashboard Link */}
          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link to="/" className="flex items-center p-3 hover:text-white">
              <FaTachometerAlt className="mr-3 text-xl" />
              <span className="text-lg">Dashboard</span>
            </Link>
          </li>

          {/* Users Link */}
          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link
              to="/usertable"
              className="flex items-center p-3 hover:text-white"
            >
              <FaUsers className="mr-3 text-xl" />
              <span className="text-lg">Users</span>
            </Link>
          </li>

          {/* Teacher Link */}
          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link
              to="/teachertable"
              className="flex items-center p-3 hover:text-white"
            >
              <GiTeacher className="mr-3 text-xl" />
              <span className="text-lg">Teacher</span>
            </Link>
          </li>

          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link
              to="/requesttable"
              className="flex items-center p-3 hover:text-white"
            >
              <VscGitPullRequestNewChanges className="mr-3 text-xl" />
              <span className="text-lg">Request</span>
            </Link>
          </li>

          {/* Schedule Link with Dropdown */}
          <li className="rounded-md mx-2">
            <button
              onClick={toggleDropdown}
              className={`flex items-center p-3 w-full text-left hover:text-white transition-all duration-300 ease-in-out ${
                isDropdownOpen ? "bg-indigo-600" : "hover:bg-indigo-600"
              }`}
            >
              <AiOutlineSchedule className="mr-3 text-xl" />
              <span className="text-lg">Schedule</span>
              <FaChevronDown
                className={`ml-auto text-sm transition-transform duration-300 ${
                  isDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <ul className="pl-4 mt-1 space-y-1 bg-gray-800 rounded-md mx-2 py-1">
                <li className="hover:bg-indigo-500 transition-all duration-300 ease-in-out rounded-md">
                  <Link
                    to="/addschecule"
                    className="flex items-center p-2 pl-8"
                  >
                    <span>Add Schedule</span>
                  </Link>
                </li>
                <li className="hover:bg-indigo-500 transition-all duration-300 ease-in-out rounded-md">
                  <Link
                    to="/scheuletable"
                    className="flex items-center p-2 pl-8"
                  >
                    <span>All Schedule</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link
              to="/activitytable"
              className="flex items-center p-3 hover:text-white"
            >
              <LuNewspaper className="mr-3 text-xl" />
              <span className="text-lg">User Activity</span>
            </Link>
          </li>

          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link
              to="/coursetable"
              className="flex items-center p-3 hover:text-white"
            >
              <FiBook className="mr-3 text-xl" />
              <span className="text-lg">Course</span>
            </Link>
          </li>
          <li className="hover:bg-indigo-600 transition-all duration-300 ease-in-out rounded-md mx-2">
            <Link
              to="/notificationtable"
              className="flex items-center p-3 hover:text-white"
            >
              <IoNotificationsSharp className="mr-3 text-xl" />
              <span className="text-lg">Notification</span>
            </Link>
          </li>
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

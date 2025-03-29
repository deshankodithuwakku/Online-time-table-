import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaBell,
  FaRegCheckCircle,
  FaRegClock,
  FaRegTimesCircle,
  FaCheck,
} from "react-icons/fa";

const TeacherNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/getusernotifiation",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        // if (response.status === 401) {
        //   window.location.href = "/login";
        //   return;
        // }

        if (response.ok) {
          // Sort by date (newest first) and take latest 10
          const sortedNotifications = data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

          setNotifications(sortedNotifications);
          setUnreadCount(sortedNotifications.filter((n) => !n.read).length);
        } else {
          toast.error(data.message || "Failed to fetch notifications");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/teacher/notifications/mark-all-read",
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaRegCheckCircle className="text-green-500 text-xl" />;
      case "warning":
        return <FaRegTimesCircle className="text-yellow-500 text-xl" />;
      case "pending":
        return <FaRegClock className="text-purple-500 text-xl" />;
      default:
        return <FaBell className="text-blue-500 text-xl" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Latest Notifications
          </h1>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <FaBell className="mx-auto text-4xl mb-3 text-gray-300" />
              <p className="text-lg text-gray-500">No notifications found</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                  !notification.read ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{notification.message}</p>
                      {notification.link && (
                        <div className="mt-2">
                          <a
                            href={notification.link}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View details
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherNotificationsPage;

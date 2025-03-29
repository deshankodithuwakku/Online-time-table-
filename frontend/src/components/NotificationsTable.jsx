import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NotificationsTable = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    recipientType: "all",
  });
  const [errors, setErrors] = useState({
    title: "",
    message: "",
    recipientType: "",
  });

  const navigate = useNavigate();
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/getallNotification",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        setNotifications(data);
      } else {
        throw new Error(data.message || "Failed to fetch notifications");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedNotificationId(id);
    setShowDeleteModal(true);
  };

  const handleAddNotification = () => {
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      message: "",
      recipientType: "",
    };

    if (!newNotification.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (newNotification.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
      isValid = false;
    }

    if (!newNotification.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (newNotification.message.length > 500) {
      newErrors.message = "Message must be less than 500 characters";
      isValid = false;
    }

    if (!newNotification.recipientType) {
      newErrors.recipientType = "Recipient type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const confirmAddNotification = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/addnotification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNotification),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to add notification");

      setNotifications([...notifications, data]);
      toast.success("Notification added successfully");
      setNewNotification({
        title: "",
        message: "",
        recipientType: "all",
      });
      setShowAddModal(false);
      fetchNotifications();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const cancelAddNotification = () => {
    setShowAddModal(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/deleteNotification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedNotificationId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to delete notification");

      setNotifications(
        notifications.filter((n) => n.id !== selectedNotificationId)
      );
      toast.success("Notification deleted successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
      setSelectedNotificationId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedNotificationId(null);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        <button
          onClick={handleAddNotification}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add Notification
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Recipient Type</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr
              key={notification.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td
                className="px-4 py-3 cursor-pointer hover:text-blue-600"
                onClick={() =>
                  navigate(`/notificationdetails/${notification.id}`)
                }
              >
                {notification.title}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    notification.recipientType === "all"
                      ? "bg-purple-100 text-purple-800"
                      : notification.recipientType === "students"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {notification.recipientType}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(notification.id);
                  }}
                  className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Notification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Notification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newNotification.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.title ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={newNotification.message}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.message ? "border-red-500" : ""
                  }`}
                  rows="3"
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Type *
                </label>
                <select
                  name="recipientType"
                  value={newNotification.recipientType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.recipientType ? "border-red-500" : ""
                  }`}
                >
                  <option value="all">All</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                </select>
                {errors.recipientType && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.recipientType}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={cancelAddNotification}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddNotification}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Add Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Notification</h3>
            <p className="mb-6">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTable;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NoticeTable = () => {
  // State management
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    title: "",
    recipientType: "",
    startDate: "",
    endDate: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: "",
    message: "",
    recipientType: "all",
  });
  const [errors, setErrors] = useState({
    title: "",
    message: "",
    recipientType: "",
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const navigate = useNavigate();

  // Fetch notices with filters
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.title) query.append("title", filters.title);
      if (filters.recipientType) query.append("recipientType", filters.recipientType);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);

      const response = await fetch(
        `http://localhost:8080/api/notice/getNotices?${query.toString()}`,
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
        setNotices(data);
      } else {
        throw new Error(data.message || "Failed to fetch notices");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Download functionality
  const handleDownloadPdf = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.title) query.append("title", filters.title);
      if (filters.recipientType) query.append("recipientType", filters.recipientType);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);
      query.append("download", "pdf");

      const response = await fetch(
        `http://localhost:8080/api/notice/getNotices?${query.toString()}`,
        { credentials: "include" }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temporary link to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "notices.pdf";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      toast.error(`Failed to download PDF: ${err.message}`);
    }
  };

  // Notice CRUD operations
  const handleDeleteClick = (id) => {
    setSelectedNoticeId(id);
    setShowDeleteModal(true);
  };

  const handleAddNotice = () => {
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotice((prev) => ({
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

    if (!newNotice.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (newNotice.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
      isValid = false;
    }

    if (!newNotice.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (newNotice.message.length > 500) {
      newErrors.message = "Message must be less than 500 characters";
      isValid = false;
    }

    if (!newNotice.recipientType) {
      newErrors.recipientType = "Recipient type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const confirmAddNotice = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/api/notice/addNotice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNotice),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to add notice");

      toast.success("Notice added successfully");
      setNewNotice({
        title: "",
        message: "",
        recipientType: "all",
      });
      setShowAddModal(false);
      fetchNotices();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const cancelAddNotice = () => {
    setShowAddModal(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/notice/deleteNotice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedNoticeId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to delete notice");

      toast.success("Notice deleted successfully");
      fetchNotices();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
      setSelectedNoticeId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedNoticeId(null);
  };

  const handleUpdateClick = (notice) => {
    setSelectedNotice(notice);
    setNewNotice({
      title: notice.title,
      message: notice.message,
      recipientType: notice.recipientType,
    });
    setShowUpdateModal(true);
  };

  const confirmUpdateNotice = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/api/notice/updateNotice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedNotice.id,
            title: newNotice.title,
            message: newNotice.message,
            recipientType: newNotice.recipientType,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to update notice");

      toast.success("Notice updated successfully");
      setShowUpdateModal(false);
      fetchNotices();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotices();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto h-screen">
      {/* Header and Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Notices</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Download PDF
          </button>
          <button
            onClick={handleAddNotice}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Add Notice
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={filters.title}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Filter by title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Type
          </label>
          <select
            name="recipientType"
            value={filters.recipientType}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="all">All</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
      <button
        onClick={fetchNotices}
        className="px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Apply Filters
      </button>

      {/* Notices Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Recipient Type</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => (
            <tr
              key={notice.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{notice.title}</td>
              <td className="px-4 py-3">
                {notice.message.length > 50
                  ? `${notice.message.substring(0, 50)}...`
                  : notice.message}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    notice.recipientType === "all"
                      ? "bg-purple-100 text-purple-800"
                      : notice.recipientType === "student"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {notice.recipientType}
                </span>
              </td>
              <td className="px-4 py-3">
                {new Date(notice.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 space-x-2">
                <button
                  onClick={() => handleUpdateClick(notice)}
                  className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteClick(notice.id)}
                  className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Notice</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newNotice.title}
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
                  value={newNotice.message}
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
                  value={newNotice.recipientType}
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
                onClick={cancelAddNotice}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddNotice}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Add Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Notice</h3>
            <p className="mb-6">
              Are you sure you want to delete this notice?
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

      {/* Update Notice Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Notice</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newNotice.title}
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
                  value={newNotice.message}
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
                  value={newNotice.recipientType}
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
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateNotice}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Update Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeTable;
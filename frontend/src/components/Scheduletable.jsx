import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [filters, setFilters] = useState({
    courseName: "",
    venue: "",
    startDate: "",
    endDate: "",
    recipientType: "",
  });

  const [editFormData, setEditFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    duration: "",
    description: "",
    recipientType: "",
  });

  const navigate = useNavigate();
  const handleScheduleClick = (scheduleId) => {
    navigate(`/schuledetails/${scheduleId}`);
  };

  // const fetchSchedules = async () => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:8080/api/admin/getallschedule",
  //       {
  //         credentials: "include",
  //       }
  //     );
  //     const data = await response.json();
  //     if (response.status === 401) {
  //       window.location.href = "/login";
  //       return;
  //     }
  //     if (response.ok) {
  //       setSchedules(data.data);
  //       setFilteredSchedules(data.data);
  //     } else {
  //       throw new Error(data.message || "Failed to fetch schedules");
  //     }
  //   } catch (error) {
  //     setError(error.message);
  //     toast.error(error.message || "Error fetching schedules");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchSchedules = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(filterParams)) {
        if (value) query.append(key, value);
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/getallschedule?${query.toString()}`,
        { credentials: "include" }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        setSchedules(data.data || []);
        setFilteredSchedules(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch schedules");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || "Error fetching schedules");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSchedules();
  }, []);

  const applyFilters = () => {
    const hasFilters = Object.values(filters).some((val) => val !== "");

    if (hasFilters) {
      fetchSchedules(filters);
    } else {
      fetchSchedules();
    }
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      courseName: "",
      venue: "",
      startDate: "",
      endDate: "",
      recipientType: "",
    });
    fetchSchedules();
  };

  const handleEdit = (schedule) => {
    setSelectedScheduleId(schedule.id);
    setEditFormData({
      date: schedule.date.split("T")[0], // Extract date part from ISO string
      startTime: schedule.startTime.split("T")[1].substring(0, 5), // Extract HH:MM from ISO string
      endTime: schedule.endTime.split("T")[1].substring(0, 5), // Extract HH:MM from ISO string
      venue: schedule.venue,
      duration: schedule.duration?.toString() || "",
      description: schedule.description || "",
      recipientType: schedule.recipientType || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedScheduleId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/deleteschedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedScheduleId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete schedule");
      }

      setSchedules(
        schedules.filter((schedule) => schedule.id !== selectedScheduleId)
      );
      toast.success(data.message || "Schedule deleted successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
      setSelectedScheduleId(null);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/updateschedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedScheduleId,
            ...editFormData,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Failed to update schedule");
      }

      // Update the local state with the new schedule data
      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule.id === selectedScheduleId
            ? {
                ...schedule,
                date: editFormData.date,
                startTime: `${editFormData.date}T${editFormData.startTime}:00Z`,
                endTime: `${editFormData.date}T${editFormData.endTime}:00Z`,
                venue: editFormData.venue,
                duration: parseInt(editFormData.duration),
                description: editFormData.description,
                recipientType: editFormData.recipientType,
              }
            : schedule
        )
      );

      toast.success(data.message || "Schedule updated successfully");
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/getallschedule?download=pdf",
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
      a.download = "schedules.pdf";
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

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Schedules List
        </h2>
        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Download PDF
        </button>
      </div>
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Course Name Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Course
            </label>
            <input
              type="text"
              name="courseName"
              value={filters.courseName}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter course name"
            />
          </div>

          {/* Venue Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Venue
            </label>
            <input
              type="text"
              name="venue"
              value={filters.venue}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter venue"
            />
          </div>

          {/* Recipient Type Filter */}
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
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
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

        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">Course Name</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Start Time</th>
            <th className="px-4 py-3">End Time</th>
            <th className="px-4 py-3">Venue</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.map((schedule) => (
            <tr
              key={schedule.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td
                className="px-4 py-3 cursor-pointer text-gray-600"
                onClick={() => handleScheduleClick(schedule.id)}
              >
                {schedule.course?.name || "N/A"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(schedule.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {schedule.startTime.split("T")[1].substring(0, 5)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {schedule.endTime.split("T")[1].substring(0, 5)}
              </td>
              <td className="px-4 py-3 text-gray-600">{schedule.venue}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleEdit(schedule)}
                  className="px-2 py-1 text-xs font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(schedule.id)}
                  className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Schedule</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={editFormData.startTime}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={editFormData.endTime}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={editFormData.venue}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient Type
                  </label>
                  <select
                    name="recipientType"
                    value={editFormData.recipientType}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Select</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this schedule?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;

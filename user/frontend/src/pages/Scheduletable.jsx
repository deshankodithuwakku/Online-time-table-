import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const TeacherSchedulesTable = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const userData = JSON.parse(localStorage.getItem("userId"));
  const teacherId = userData?.userId;

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/getteacherschedule/${teacherId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch schedules");
      }

      setSchedules(data.data);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchSchedules();
    }
  }, [teacherId]);

  const handleCancelSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/reasignteacher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduleId: selectedSchedule.scheduleId,
            venue: selectedSchedule.venue,
            date: selectedSchedule.date,
            startTime: selectedSchedule.startTime,
            endTime: selectedSchedule.endTime,
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
        throw new Error(data.message || "Failed to cancel/reassign schedule");
      }

      if (data.action === "reassigned") {
        toast.success(`Schedule reassigned to ${data.newTeacher.name}`);
      } else {
        toast.success("Schedule cancelled - no alternative teacher available");
      }

      // Refresh the schedules after successful action
      await fetchSchedules();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowCancelModal(false);
      setSelectedSchedule(null);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Teaching Schedules
        </h2>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Date & Time</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Examiners</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr
              key={schedule.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">
                <div className="font-medium">{schedule.course?.name}</div>
                <div className="text-xs text-gray-500">
                  {schedule.course?.description}
                </div>
              </td>
              <td className="px-4 py-3">
                {formatDate(schedule.date)}
                <div className="text-xs text-gray-500">
                  {new Date(schedule.startTime).toLocaleTimeString()} -{" "}
                  {new Date(schedule.endTime).toLocaleTimeString()}
                </div>
              </td>
              <td className="px-4 py-3">{schedule.duration} minutes</td>
              <td className="px-4 py-3">{schedule.venue}</td>
              <td className="px-4 py-3">
                {schedule.assignedExaminers?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {schedule.assignedExaminers.map((examiner, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {examiner.user.firstName} {examiner.user.lastName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">None assigned</span>
                )}
              </td>
              <td className="px-4 py-3">
                {schedule.status !== "cancelled" &&
                  schedule.status !== "completed" && (
                    <button
                      onClick={() => handleCancelSchedule(schedule)}
                      className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                    >
                      Cancel/Reassign
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cancel Schedule Confirmation Modal */}
      {showCancelModal && selectedSchedule && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Cancel Schedule</h3>
            <p className="mb-2 text-sm">
              <span className="font-medium">Schedule ID: </span>
              {selectedSchedule.scheduleId}
            </p>
            <p className="mb-2">
              <strong>Course:</strong> {selectedSchedule.course?.name}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {formatDate(selectedSchedule.date)}
            </p>
            <p className="mb-2">
              <strong>Time:</strong>{" "}
              {new Date(selectedSchedule.startTime).toLocaleTimeString()} -{" "}
              {new Date(selectedSchedule.endTime).toLocaleTimeString()}
            </p>
            <p className="mb-2">
              <strong>Venue:</strong> {selectedSchedule.venue}
            </p>
            <p className="mb-4">
              Are you sure you want to cancel this schedule? The system will try
              to find a replacement teacher.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                No, Keep It
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {schedules.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No schedules found for this teacher
        </div>
      )}
    </div>
  );
};

export default TeacherSchedulesTable;

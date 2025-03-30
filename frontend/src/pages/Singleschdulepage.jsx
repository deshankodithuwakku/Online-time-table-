import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ScheduleDetailsPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    teacherId: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    duration: 0,
    description: "",
    recipientType: "all",
  });

  const { id } = useParams();

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/admin/getsingleschedule/${id}`,
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
          setSchedule(data.data);
          setFormData({
            scheduleId: data.data.id,
            courseId: data.data.courseId,
            teacherId: data.data.teacherId || "",
            date: data.data.date.split("T")[0],
            startTime: data.data.startTime.split("T")[1].substring(0, 5),
            endTime: data.data.endTime.split("T")[1].substring(0, 5),
            venue: data.data.venue,
            duration: data.data.duration,
            description: data.data.description || "",
            recipientType: data.data.recipientType || "all",
          });
        } else {
          toast.error(
            data.message || "Something went wrong. Please try again."
          );
        }
        setLoading(false);
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [id]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/getallteachers",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        setTeachers(data.data);
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/admin/reassignschedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduleId: formData.scheduleId,
            teacherId: formData.teacherId,
            recipientType: "all",
          }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      setSchedule((prev) => ({
        ...prev,
        teacherId: formData.teacherId,
        description: formData.description,
      }));
      toast.success("Schedule reassigned successfully!");
      setShowFormModal(false);
    } catch (error) {
      console.error("Error reassigning schedule:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center text-lg font-medium">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        {/* Schedule details display */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mt-4">Schedule Details</h1>
          <p className="text-lg text-gray-600">ID: {schedule?.id}</p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Schedule Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Course ID:</span>
              <span className="text-gray-600">{schedule?.courseId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Teacher ID:</span>
              <span className="text-gray-600">{schedule?.teacherId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Venue</span>
              <span className="text-gray-600">{schedule?.venue}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Date:</span>
              <span className="text-gray-600">
                {schedule?.date && new Date(schedule.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Start Time:</span>
              <span>
                {new Date(schedule?.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // Set to false for 24-hour format
                })}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">End Time:</span>
              <span>
                {new Date(schedule?.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // Set to false for 24-hour format
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Status:</span>
              <span
                className={`text-sm font-semibold ${
                  schedule.status === "active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {schedule.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={() => setShowFormModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Reassign Teacher
          </button>
        </div>
      </div>

      {/* Popup Form */}
      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Update Schedule</h3>

            <form onSubmit={handleSubmit}>
              {/* All hidden inputs */}
              <input
                type="hidden"
                name="courseId"
                value={formData.scheduleId}
              />
              <div className="space-y-4 mb-6">
                {/* Only visible inputs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher *
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
                >
                  Reassign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDetailsPage;

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ScheduleRequestForm = ({ onSubmit }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get teacher ID from localStorage
  const userData = JSON.parse(localStorage.getItem("userId"));
  const teacherId = userData?.userId;

  const [formData, setFormData] = useState({
    courseId: "",
    courseName: "",
    teacherId: teacherId,
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/admin/allcourses",
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
          setCourses(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch courses");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);

    // Course validation
    if (!formData.courseId || !formData.courseName) {
      newErrors.courseName = "Please select a course";
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (selectedDate < today) {
      newErrors.date = "Date cannot be in the past";
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time";
    }

    // Venue validation
    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required";
    } else if (formData.venue.length > 100) {
      newErrors.venue = "Venue must be less than 100 characters";
    }

    // Duration validation
    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    } else if (isNaN(formData.duration)) {
      newErrors.duration = "Duration must be a number";
    } else if (formData.duration <= 0) {
      newErrors.duration = "Duration must be positive";
    } else if (formData.duration > 240) {
      newErrors.duration = "Duration cannot exceed 4 hours (240 minutes)";
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    if (name === "courseName") {
      const selectedCourse = courses.find((course) => course.name === value);
      setFormData({
        ...formData,
        courseName: value,
        courseId: selectedCourse ? selectedCourse.id : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Auto-calculate duration if both start and end times are present
    if (
      (name === "startTime" || name === "endTime") &&
      formData.startTime &&
      formData.endTime
    ) {
      const [startHours, startMinutes] = formData.startTime
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = formData.endTime.split(":").map(Number);

      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (endTotal > startTotal) {
        setFormData((prev) => ({
          ...prev,
          duration: (endTotal - startTotal).toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/createschedulerequest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        toast.success(data.message);
        if (typeof onSubmit === "function") {
          onSubmit(data.request);
        }
        setFormData({
          ...formData,
          courseId: "",
          courseName: "",
          date: "",
          startTime: "",
          endTime: "",
          venue: "",
          duration: "",
          description: "",
        });
        setErrors({});
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">New Schedule Request</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.courseName ? "border-red-500" : ""
              }`}
              required
              disabled={loading}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.courseName && (
              <p className="mt-1 text-sm text-red-500">{errors.courseName}</p>
            )}
            <input type="hidden" name="courseId" value={formData.courseId} />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.date ? "border-red-500" : ""
              }`}
              required
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.startTime ? "border-red-500" : ""
              }`}
              required
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.endTime ? "border-red-500" : ""
              }`}
              required
              min={formData.startTime}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.venue ? "border-red-500" : ""
              }`}
              required
              maxLength="100"
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.duration ? "border-red-500" : ""
              }`}
              required
              min="1"
              max="240"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full p-2 border rounded ${
              errors.description ? "border-red-500" : ""
            }`}
            maxLength="500"
          />
          <div className="flex justify-between">
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
            <span className="text-xs text-gray-500">
              {formData.description.length}/500 characters
            </span>
          </div>
        </div>

        {/* Hidden teacherId field */}
        <input type="hidden" name="teacherId" value={formData.teacherId} />

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default ScheduleRequestForm;

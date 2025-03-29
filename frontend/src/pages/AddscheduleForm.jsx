import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ScheduleForm = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState({
    courses: false,
    teachers: false,
  });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    courseId: "",
    courseName: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    duration: "",
    description: "",
    teacherId: "",
    teacherName: "",
    recipientType: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        setLoading((prev) => ({ ...prev, courses: true }));
        const coursesResponse = await fetch(
          "http://localhost:8080/api/admin/allcourses",
          {
            credentials: "include",
          }
        );
        const coursesData = await coursesResponse.json();
        if (coursesResponse.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (coursesResponse.ok) {
          setCourses(coursesData.data);
        }

        // Fetch teachers
        setLoading((prev) => ({ ...prev, teachers: true }));
        const teachersResponse = await fetch(
          "http://localhost:8080/api/admin/getallteachers",
          {
            credentials: "include",
          }
        );
        const teachersData = await teachersResponse.json();
        if (teachersResponse.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (teachersResponse.ok) {
          setTeachers(teachersData.data || []);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading({ courses: false, teachers: false });
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Course validation
    if (!formData.courseName) {
      newErrors.courseName = "Please select a course";
    }

    // Teacher validation
    if (!formData.teacherName) {
      newErrors.teacherName = "Please select a teacher";
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.startTime = "Please select start time";
    }
    if (!formData.endTime) {
      newErrors.endTime = "Please select end time";
    }
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Duration validation
    if (!formData.duration) {
      newErrors.duration = "Please enter duration";
    } else if (formData.duration <= 0) {
      newErrors.duration = "Duration must be positive";
    } else if (formData.duration > 1440) {
      newErrors.duration = "Duration cannot exceed 24 hours";
    }

    // Venue validation
    if (!formData.venue) {
      newErrors.venue = "Please enter venue";
    } else if (formData.venue.length > 100) {
      newErrors.venue = "Venue cannot exceed 100 characters";
    }

    // Recipient type validation
    if (!formData.recipientType) {
      newErrors.recipientType = "Please select recipient type";
    }

    // Description validation
    if (!formData.description) {
      newErrors.description = "Please enter description";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Handle course selection
    if (name === "courseName") {
      const selectedCourse = courses.find((course) => course.name === value);
      setFormData({
        ...formData,
        courseName: value,
        courseId: selectedCourse ? selectedCourse.id : "",
      });
    }
    // Handle teacher selection
    else if (name === "teacherName") {
      const selectedTeacher = teachers.find(
        (teacher) => `${teacher.firstName} ${teacher.lastName}` === value
      );
      setFormData({
        ...formData,
        teacherName: value,
        teacherId: selectedTeacher ? selectedTeacher.id : "",
      });
    }
    // Handle other fields
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/addschedule",
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
        // Reset form
        setFormData({
          courseId: "",
          courseName: "",
          date: "",
          startTime: "",
          endTime: "",
          venue: "",
          duration: "",
          description: "",
          teacherId: "",
          teacherName: "",
          recipientType: "",
        });
        navigate("/scheuletable");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Add New Schedule
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        noValidate
      >
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.courseName ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading.courses}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.courseName && (
              <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>
            )}
            <input type="hidden" name="courseId" value={formData.courseId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher
            </label>
            <select
              name="teacherName"
              value={formData.teacherName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.teacherName ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading.teachers}
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option
                  key={teacher.id}
                  value={`${teacher.firstName} ${teacher.lastName}`}
                >
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            {errors.teacherName && (
              <p className="mt-1 text-sm text-red-600">{errors.teacherName}</p>
            )}
            <input type="hidden" name="teacherId" value={formData.teacherId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.date ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.startTime ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Type
            </label>
            <select
              name="recipientType"
              value={formData.recipientType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.recipientType ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select recipient type</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="all">All</option>
            </select>
            {errors.recipientType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.recipientType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.venue ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              maxLength={100}
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.duration ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="1"
              max="1440"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.endTime ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Full Width Fields */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            maxLength={500}
          />
          <div className="flex justify-between">
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <span className="text-xs text-gray-500">
              {formData.description.length}/500 characters
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-1 md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;

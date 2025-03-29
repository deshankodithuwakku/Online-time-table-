import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CoursesTable = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    teacherIds: [],
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    teacherIds: "",
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch courses
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
      // Fetch teachers
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

      if (coursesResponse.ok && teachersResponse.ok) {
        setCourses(coursesData.data);
        setTeachers(teachersData.data || []);
      } else {
        throw new Error(
          coursesData.message || teachersData.message || "Failed to fetch data"
        );
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowDeleteModal(true);
  };

  const handleAddCourse = () => {
    setShowAddModal(true);
  };

  const handleTeacherSelect = (teacherId) => {
    setNewCourse((prev) => {
      if (prev.teacherIds.includes(teacherId)) {
        return {
          ...prev,
          teacherIds: prev.teacherIds.filter((id) => id !== teacherId),
        };
      } else {
        return {
          ...prev,
          teacherIds: [...prev.teacherIds, teacherId],
        };
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      description: "",
      teacherIds: "",
    };

    if (!newCourse.name.trim()) {
      newErrors.name = "Course name is required";
      isValid = false;
    } else if (newCourse.name.length > 100) {
      newErrors.name = "Course name must be less than 100 characters";
      isValid = false;
    }

    if (newCourse.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
      isValid = false;
    }

    if (newCourse.teacherIds.length === 0) {
      newErrors.teacherIds = "At least one teacher must be selected";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const confirmAddCourse = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/addcourse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCourse),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add course");

      if (data.course) {
        setCourses([...courses, data.course]);
      }
      toast.success(data.message);
      setNewCourse({
        name: "",
        description: "",
        teacherIds: [],
      });
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const cancelAddCourse = () => {
    setNewCourse({
      name: "",
      description: "",
      teacherIds: [],
    });
    setShowAddModal(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/deletecourse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: selectedCourseId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to delete course");

      setCourses(courses.filter((course) => course.id !== selectedCourseId));
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
      setSelectedCourseId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedCourseId(null);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Courses List</h2>
        <button
          onClick={handleAddCourse}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add Course
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td
                className="px-4 py-3 cursor-pointer"
                onClick={() => navigate(`/coursedetails/${course.id}`)}
              >
                {course.id}
              </td>
              <td className="px-4 py-3 font-medium">{course.name}</td>
              <td className="px-4 py-3 text-gray-600">{course.description}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDeleteClick(course.id)}
                  className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCourse.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  rows="3"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Teachers *
                </label>
                <div
                  className={`max-h-40 overflow-y-auto border rounded p-2 ${
                    errors.teacherIds ? "border-red-500" : ""
                  }`}
                >
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`teacher-${teacher.id}`}
                          checked={newCourse.teacherIds.includes(teacher.id)}
                          onChange={() => handleTeacherSelect(teacher.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`teacher-${teacher.id}`}>
                          {teacher.firstName} {teacher.lastName}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No teachers available</p>
                  )}
                </div>
                {errors.teacherIds && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.teacherIds}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={cancelAddCourse}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddCourse}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Course</h3>
            <p className="mb-6">Are you sure you want to delete this course?</p>
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

export default CoursesTable;

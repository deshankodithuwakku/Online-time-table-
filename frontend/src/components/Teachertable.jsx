import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TeachersTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedVerifyId, setSelectedVerifyId] = useState(null);

  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    contactNumber: "",
    avatar: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    gender: "",
    contactNumber: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const handleUserProfileClick = (userId) => {
    navigate(`/teacherprofile/${userId}`);
  };

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

        console.log(data);
        setTeachers(data.data);
        toast.success(data.message);
      } catch (error) {
        setError(error.message);
        toast.error("Error fetching teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleEdit = (teacher) => {
    setSelectedTeacherId(teacher.id);
    setEditFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      gender: teacher.gender,
      contactNumber: teacher.contactNumber,
      avatar: teacher.avatar,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedTeacherId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/deleteteacher",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedTeacherId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to delete teacher");

      setTeachers(
        teachers.filter((teacher) => teacher.id !== selectedTeacherId)
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
      setSelectedTeacherId(null);
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/updateteacher",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedTeacherId,
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
      if (!response.ok)
        throw new Error(data.message || "Failed to update teacher");

      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.id === selectedTeacherId
            ? { ...teacher, ...editFormData }
            : teacher
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowEditModal(false);
      setSelectedTeacherId(null);
    }
  };

  const handleVerifyClick = (id) => {
    setSelectedVerifyId(id);
    setShowVerifyModal(true);
  };

  const confirmVerify = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/verifyteacher",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedVerifyId, status: "active" }),
          credentials: "include",
        }
      );

      const data = await response.json();
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.id === selectedVerifyId
            ? { ...teacher, status: "active" }
            : teacher
        )
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowVerifyModal(false);
      setSelectedVerifyId(null);
    }
  };

  const validateAddForm = () => {
    const newErrors = {};

    if (!addFormData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(addFormData.email))
      newErrors.email = "Email is invalid";

    if (!addFormData.firstName) newErrors.firstName = "First name is required";
    if (!addFormData.lastName) newErrors.lastName = "Last name is required";
    if (!addFormData.password) newErrors.password = "Password is required";
    else if (addFormData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (addFormData.password !== addFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!addFormData.gender) newErrors.gender = "Gender is required";
    if (!addFormData.contactNumber)
      newErrors.contactNumber = "Contact number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!validateAddForm()) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("email", addFormData.email);
      formData.append("firstName", addFormData.firstName);
      formData.append("lastName", addFormData.lastName);
      formData.append("password", addFormData.password);
      formData.append("gender", addFormData.gender);
      formData.append("contactNumber", addFormData.contactNumber);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch(
        "http://localhost:8080/api/admin/addteacher",
        {
          method: "POST",
          body: formData,
          credentials: "include",
          // Note: Don't set Content-Type header when using FormData
          // The browser will set it automatically with the correct boundary
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to add teacher");

      // Refresh the teachers list
      const teachersResponse = await fetch(
        "http://localhost:8080/api/admin/getallteachers",
        {
          credentials: "include",
        }
      );
      const teachersData = await teachersResponse.json();
      setTeachers(teachersData.data);

      toast.success(data.message);
      setShowAddModal(false);
      resetAddForm();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      gender: "",
      contactNumber: "",
    });
    setAvatarFile(null);
    setPreviewAvatar("");
    setErrors({});
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Teachers List</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add Teacher
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Avatar</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr
              key={teacher.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td
                className="px-4 py-3 cursor-pointer"
                onClick={() => handleUserProfileClick(teacher.id)}
              >
                {teacher.id}
              </td>
              <td className="px-4 py-3">
                <img
                  src={`http://localhost:8080${teacher.avatar}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border"
                />
              </td>
              <td className="px-4 py-3">
                {teacher.firstName} {teacher.lastName}
              </td>
              <td className="px-4 py-3">{teacher.contactNumber}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    teacher.status === "active"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {teacher.status === "active" ? "Completed" : "Failed"}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleEdit(teacher)}
                  className="px-2 py-1 text-xs font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(teacher.id)}
                  className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition mr-1"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleVerifyClick(teacher.id)}
                  className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Teacher</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={editFormData.contactNumber}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded"
                  required
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
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this teacher?</p>
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
      {showVerifyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Verify Teacher</h3>
            <p>Are you sure you want to verify this teacher?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={addFormData.firstName}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={addFormData.password}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={addFormData.email}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number*
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={addFormData.contactNumber}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.contactNumber ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {errors.contactNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.contactNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={addFormData.lastName}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password*
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={addFormData.confirmPassword}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender*
                    </label>
                    <select
                      name="gender"
                      value={addFormData.gender}
                      onChange={handleAddChange}
                      className={`w-full px-3 py-2 border rounded ${
                        errors.gender ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar Upload - Full width below the columns */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Avatar
                </label>
                <div className="mt-1 flex items-center">
                  <label className="inline-block w-full overflow-hidden rounded-md border border-gray-300 bg-white px-3 py-2">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      {previewAvatar ? (
                        <>
                          <img
                            src={previewAvatar}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-full"
                          />
                          <span className="text-sm text-gray-600">
                            {avatarFile?.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            Click to upload an image
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition flex items-center justify-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="animate-pulse mr-2">...</span>
                      Adding
                    </>
                  ) : (
                    "Add Teacher"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersTable;

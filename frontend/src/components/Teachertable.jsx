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
  const [isDownloading, setIsDownloading] = useState(false);

  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    status: "",
  });
  const [filteredTeachers, setFilteredTeachers] = useState([]);

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
      setFilteredTeachers(data.data);
      toast.success(data.message);
    } catch (error) {
      setError(error.message);
      toast.error("Error fetching teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const applyFilters = () => {
    let results = [...teachers];

    if (filters.firstName) {
      results = results.filter((teacher) =>
        teacher.firstName
          .toLowerCase()
          .includes(filters.firstName.toLowerCase())
      );
    }

    if (filters.lastName) {
      results = results.filter((teacher) =>
        teacher.lastName.toLowerCase().includes(filters.lastName.toLowerCase())
      );
    }

    if (filters.email) {
      results = results.filter((teacher) =>
        teacher.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.contactNumber) {
      results = results.filter((teacher) =>
        teacher.contactNumber.includes(filters.contactNumber)
      );
    }

    if (filters.status) {
      results = results.filter((teacher) => teacher.status === filters.status);
    }

    setFilteredTeachers(results);
  };

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      status: "",
    });
    setFilteredTeachers(teachers);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PDF Generation function
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      queryParams.append("download", "pdf");

      // Add active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      // Create a hidden iframe to trigger download
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = `http://localhost:8080/api/admin/getallteachers?${queryParams.toString()}`;
      document.body.appendChild(iframe);

      // Remove iframe after download
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 10000);
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

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

      toast.success(data.message);
      // Refresh teachers list
      await fetchTeachers();
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

      toast.success(data.message);
      // Refresh teachers list
      await fetchTeachers();
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
      toast.success(data.message);
      // Refresh teachers list
      await fetchTeachers();
      setShowVerifyModal(false);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
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
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to add teacher");

      toast.success(data.message);
      // Refresh teachers list
      await fetchTeachers();
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-x-auto min-h-[80vh] transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
            Teachers Management
          </span>
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className={`px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:shadow-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center gap-2 ${
              isDownloading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isDownloading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Teacher
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          Filter Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* First Name Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={filters.firstName}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                placeholder="Filter by first name"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Last Name Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={filters.lastName}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                placeholder="Filter by last name"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Contact Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="contactNumber"
                value={filters.contactNumber}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                placeholder="Filter by contact"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Status Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pl-10"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="deactive">Inactive</option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={applyFilters}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm uppercase font-semibold tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handleUserProfileClick(teacher.id)}
                  >
                    <span className="font-medium text-gray-700">
                      #{teacher.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={`http://localhost:8080${teacher.avatar}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow hover:border-blue-400 transition-all duration-200"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap font-medium"
                    onClick={() => handleUserProfileClick(teacher.id)}
                  >
                    {teacher.firstName} {teacher.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {teacher.contactNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {teacher.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-1.5 hover:bg-blue-100 rounded-md text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit teacher"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(teacher.id)}
                        className="p-1.5 hover:bg-red-100 rounded-md text-red-600 hover:text-red-800 transition-colors"
                        title="Delete teacher"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleVerifyClick(teacher.id)}
                        className="p-1.5 hover:bg-green-100 rounded-md text-green-600 hover:text-green-800 transition-colors"
                        title="Verify teacher"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">
              Edit Teacher
            </h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={editFormData.contactNumber}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this teacher? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:shadow-lg hover:from-red-600 hover:to-red-800 transition-all flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Teacher Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Verify Teacher
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to verify this teacher?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-3xl w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">
              Add New Teacher
            </h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={addFormData.firstName}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password*
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={addFormData.password}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.password
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={addFormData.email}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="contactNumber"
                        value={addFormData.contactNumber}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.contactNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.contactNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.contactNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={addFormData.lastName}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password*
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={addFormData.confirmPassword}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender*
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={addFormData.gender}
                        onChange={handleAddChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                          errors.gender ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.gender}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {previewAvatar ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={previewAvatar}
                          alt="Avatar preview"
                          className="h-24 w-24 object-cover rounded-full mb-3 border-2 border-gray-200 shadow-md"
                        />
                        <span className="text-sm text-gray-500">
                          {avatarFile?.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
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
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="avatar"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Teacher
                    </>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [verifyUserModal, setVerifyUserModal] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    contactNumber: "",
  });
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    contactNumber: "",
    avatar: "",
  });
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addStudentFormData, setAddStudentFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "male",
    contactNumber: "",
    avatarFile: null,
  });
  const [addStudentFormErrors, setAddStudentFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contactNumber: "",
    avatarFile: "",
  });
  const navigate = useNavigate();
  const handleUserProfileClick = (userId) => {
    navigate(`/userprofile/${userId}`); // Navigate to the user profile page
  };

  const fetchUsers = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(filterParams)) {
        if (value) query.append(key, value);
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/getallusers?${query.toString()}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      setUsers(data.users || []);
      setFilteredUsers(data.users || []);

      if (data.users && data.users.length === 0) {
        toast.info("No users found matching your criteria");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || "Error fetching users");
      // On error, reset to show all users
      fetchUsers(); // Fetch all users without filters
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const applyFilters = () => {
    const hasFilters = Object.values(filters).some((val) => val !== "");

    if (hasFilters) {
      fetchUsers(filters);
    } else {
      fetchUsers();
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      firstName: "",
      lastName: "",
      email: "",
      status: "",
      contactNumber: "",
    });
    fetchUsers();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PDF Download function
  const handleDownloadPdf = async () => {
    try {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) query.append(key, value);
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/getallusers?${query.toString()}&download=pdf`,
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
      a.download = "users.pdf";
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      contactNumber: "",
      avatarFile: "",
    };

    if (!addStudentFormData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }

    if (!addStudentFormData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }

    if (!addStudentFormData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(addStudentFormData.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!addStudentFormData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (!validatePassword(addStudentFormData.password)) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!addStudentFormData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
      valid = false;
    } else if (!validatePhone(addStudentFormData.contactNumber)) {
      newErrors.contactNumber =
        "Please enter a valid phone number (10-15 digits)";
      valid = false;
    }

    setAddStudentFormErrors(newErrors);
    return valid;
  };

  const handleAddStudentChange = (e) => {
    const { name, value } = e.target;
    setAddStudentFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("firstName", addStudentFormData.firstName);
      formData.append("lastName", addStudentFormData.lastName);
      formData.append("email", addStudentFormData.email);
      formData.append("password", addStudentFormData.password);
      formData.append("gender", addStudentFormData.gender);
      formData.append("contactNumber", addStudentFormData.contactNumber);
      if (addStudentFormData.avatarFile) {
        formData.append("avatar", addStudentFormData.avatarFile);
      }

      const response = await fetch("http://localhost:8080/api/admin/adduser", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Failed to add student");
      }

      toast.success("Student added successfully");
      // Refresh users list from server
      await fetchUsers();
      setShowAddStudentModal(false);
      setAddStudentFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gender: "male",
        contactNumber: "",
        avatarFile: null,
      });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEdit = (user) => {
    setSelectedUserId(user.id);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      contactNumber: user.contactNumber,
      avatar: user.avatar,
    });
    setShowEditModal(true); // Open the edit modal
  };

  const handleVerify = (id) => {
    setSelectedUserId(id);
    setVerifyUserModal(true); // Open the verify user modal
  };

  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setShowDeleteModal(true); // Open the delete confirmation modal
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/deleteuser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedUserId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to delete user");

      toast.success(data.message);
      // Refresh users list from server
      await fetchUsers();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
      setSelectedUserId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUserId(null);
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
        "http://localhost:8080/api/admin/updateuser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedUserId,
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
        throw new Error(data.message || "Failed to update user");

      toast.success(data.message);
      // Refresh users list from server instead of just updating locally
      await fetchUsers();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setShowEditModal(false);
      setSelectedUserId(null);
    }
  };

  const handleVerifySubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/verifyuser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedUserId, status: "active" }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to verify user");
      toast.success(data.message);
      
      // Refresh users list from server
      await fetchUsers();
      setVerifyUserModal(false);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const cancelVerify = () => {
    setVerifyUserModal(false);
  };

  const handleUnverify = async (id) => {
    setSelectedUserId(id);
    setVerifyUserModal(true);
  };

  const handleUnverifySubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/verifyuser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedUserId, status: "deactive" }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to unverify user");

      toast.success(data.message);
      
      // Refresh users list from server
      await fetchUsers();
      setVerifyUserModal(false);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const cancelUnverify = () => {
    setVerifyUserModal(false);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  console.log(users);
  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-x-auto min-h-[80vh] transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
            Users Management
          </span>
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadPdf}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:shadow-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
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
                placeholder="Search by first name"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
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
                placeholder="Search by last name"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Email Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-10"
                placeholder="Search by email"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Contact Number Filter */}
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
                placeholder="Search by contact"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={applyFilters}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
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
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handleUserProfileClick(user.id)}
                  >
                    <span className="font-medium text-gray-700">#{user.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={`http://localhost:8080${user.avatar}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow hover:border-blue-400 transition-all duration-200"
                    />
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap font-medium"
                    onClick={() => handleUserProfileClick(user.id)}
                  >
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.contactNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600">{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === "active" ? (
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 hover:bg-blue-100 rounded-md text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id)}
                        className="p-1.5 hover:bg-red-100 rounded-md text-red-600 hover:text-red-800 transition-colors"
                        title="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {user.status === "active" ? (
                        <button
                          onClick={() => handleUnverify(user.id)}
                          className="p-1.5 hover:bg-amber-100 rounded-md text-amber-600 hover:text-amber-800 transition-colors"
                          title="Unverify user"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(user.id)}
                          className="p-1.5 hover:bg-green-100 rounded-md text-green-600 hover:text-green-800 transition-colors"
                          title="Verify user"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
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
                  Gender
                </label>
                <select
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Avatar URL
                </label>
                <input
                  type="text"
                  name="avatar"
                  value={editFormData.avatar}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded"
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
      {/* Verify User Modal */}
      {verifyUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              {users.find((user) => user.id === selectedUserId)?.status ===
              "active"
                ? "Unverify User"
                : "Verify User"}
            </h3>
            <p className="mb-6">
              Are you sure you want to{" "}
              {users.find((user) => user.id === selectedUserId)?.status ===
              "active"
                ? "unverify"
                : "verify"}{" "}
              this user?
            </p>
            <div className="flex justify-end">
              <button
                onClick={cancelUnverify}
                className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={
                  users.find((user) => user.id === selectedUserId)?.status ===
                  "active"
                    ? handleUnverifySubmit
                    : handleVerifySubmit
                }
                className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
              >
                {users.find((user) => user.id === selectedUserId)?.status ===
                "active"
                  ? "Unverify"
                  : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete User</h3>
            <p className="mb-6">Are you sure you want to delete this user?</p>
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
      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 backdrop-blur-lg z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudentSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={addStudentFormData.firstName}
                      onChange={handleAddStudentChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {addStudentFormErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {addStudentFormErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={addStudentFormData.lastName}
                      onChange={handleAddStudentChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {addStudentFormErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {addStudentFormErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={addStudentFormData.email}
                      onChange={handleAddStudentChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {addStudentFormErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {addStudentFormErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={addStudentFormData.password}
                      onChange={handleAddStudentChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {addStudentFormErrors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {addStudentFormErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={addStudentFormData.gender}
                      onChange={handleAddStudentChange}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={addStudentFormData.contactNumber}
                      onChange={handleAddStudentChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {addStudentFormErrors.contactNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {addStudentFormErrors.contactNumber}
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
                      {addStudentFormData.avatarFile ? (
                        <>
                          <img
                            src={URL.createObjectURL(
                              addStudentFormData.avatarFile
                            )}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-full"
                          />
                          <span className="text-sm text-gray-600">
                            {addStudentFormData.avatarFile.name}
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
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAddStudentFormData({
                              ...addStudentFormData,
                              avatarFile: e.target.files[0],
                            });
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                  </label>
                </div>
                {addStudentFormErrors.avatarFile && (
                  <p className="text-red-500 text-xs mt-1">
                    {addStudentFormErrors.avatarFile}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 mr-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;

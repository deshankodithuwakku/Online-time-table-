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

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch(
  //         "http://localhost:8080/api/admin/getallusers",
  //         {
  //           credentials: "include",
  //         }
  //       );
  //       const data = await response.json();
  //       if (response.status === 401) {
  //         window.location.href = "/login";
  //         return;
  //       }
  //       setUsers(data.users);
  //       toast.success(data.message);
  //     } catch (error) {
  //       setError(error.message);
  //       toast.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

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

      const usersResponse = await fetch(
        "http://localhost:8080/api/admin/getallusers",
        {
          credentials: "include",
        }
      );

      const usersData = await usersResponse.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      setUsers(usersData.users);

      toast.success("Student added successfully");
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

      setUsers(users.filter((user) => user.id !== selectedUserId));
      toast.success(data.message);
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

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId ? { ...user, ...editFormData } : user
        )
      );
      toast.success(data.message);
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
          body: JSON.stringify({ id: selectedUserId, status: "active" }), // Set to "active" or another status
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
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId ? { ...user, status: "active" } : user
        )
      );
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
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId ? { ...user, status: "inactive" } : user
        )
      );
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
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto h-180">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Users List</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Download PDF
          </button>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Add Student
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* First Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={filters.firstName}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Search by first name"
            />
          </div>

          {/* Last Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={filters.lastName}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Search by last name"
            />
          </div>

          {/* Email Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Search by email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Contact Number Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={filters.contactNumber}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Search by contact"
            />
          </div>

          {/* Status Filter */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div> */}
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
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Avatar</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className="border-b hover:bg-gray-50 transition cursor-pointer"
            >
              <td
                className="px-4 py-3"
                onClick={() => handleUserProfileClick(user.id)}
              >
                {user.id}
              </td>
              <td className="px-4 py-3">
                <img
                  src={`http://localhost:8080${user.avatar}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border"
                />
              </td>
              <td className="px-4 py-3">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-4 py-3">{user.contactNumber}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    user.status === "active"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {user.status === "active" ? "Completed" : "Failed"}
                </span>
              </td>
              <td className="px-2 py-3">
                <button
                  onClick={() => handleEdit(user)}
                  className="px-2 py-1 text-xs font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(user.id)}
                  className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition mr-1"
                >
                  Delete
                </button>
                {user.status === "active" ? (
                  <button
                    onClick={() => handleUnverify(user.id)}
                    className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  >
                    Unverify
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(user.id)}
                    className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Verify
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

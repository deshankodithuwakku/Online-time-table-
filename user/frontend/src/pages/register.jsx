import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaUserCircle,
  FaUpload,
} from "react-icons/fa";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    gender: "",
    contactNumber: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // const validateForm = () => {
  //   const newErrors = {};
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const phoneRegex =
  //     /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{3,6}$/;
  //   const passwordRegex =
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //   // First Name validation
  //   if (!formData.firstName.trim()) {
  //     newErrors.firstName = "First name is required";
  //   } else if (formData.firstName.length < 2) {
  //     newErrors.firstName = "First name must be at least 2 characters";
  //   } else if (formData.firstName.length > 50) {
  //     newErrors.firstName = "First name must be less than 50 characters";
  //   }

  //   // Last Name validation
  //   if (!formData.lastName.trim()) {
  //     newErrors.lastName = "Last name is required";
  //   } else if (formData.lastName.length < 2) {
  //     newErrors.lastName = "Last name must be at least 2 characters";
  //   } else if (formData.lastName.length > 50) {
  //     newErrors.lastName = "Last name must be less than 50 characters";
  //   }

  //   // Email validation
  //   if (!formData.email.trim()) {
  //     newErrors.email = "Email is required";
  //   } else if (!emailRegex.test(formData.email)) {
  //     newErrors.email = "Please enter a valid email address";
  //   }

  //   // Password validation
  //   if (!formData.password) {
  //     newErrors.password = "Password is required";
  //   } else if (!passwordRegex.test(formData.password)) {
  //     newErrors.password =
  //       "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
  //   }

  //   // Confirm Password validation
  //   if (!formData.confirmPassword) {
  //     newErrors.confirmPassword = "Please confirm your password";
  //   } else if (formData.password !== formData.confirmPassword) {
  //     newErrors.confirmPassword = "Passwords do not match";
  //   }

  //   // Gender validation
  //   if (!formData.gender) {
  //     newErrors.gender = "Gender is required";
  //   }

  //   // Contact Number validation
  //   if (!formData.contactNumber.trim()) {
  //     newErrors.contactNumber = "Contact number is required";
  //   } else if (!phoneRegex.test(formData.contactNumber)) {
  //     newErrors.contactNumber = "Please enter a valid phone number";
  //   }

  //   // Avatar validation
  //   if (!formData.avatar) {
  //     newErrors.avatar = "Profile picture is required";
  //   } else if (formData.avatar.size > 2 * 1024 * 1024) {
  //     // 2MB limit
  //     newErrors.avatar = "Image size must be less than 2MB";
  //   } else if (!formData.avatar.type.match("image.*")) {
  //     newErrors.avatar = "Only image files are allowed";
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };
  const validateForm = () => {
    const newErrors = {};

    // Regular expressions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex = /^(?:\+94|0|94)?(?:7[01245678])(?:\d{7})$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Contact Number validation - Sri Lankan specific
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else {
      // Remove all non-digit characters
      const cleanedNumber = formData.contactNumber.replace(/\D/g, "");

      // Validate Sri Lankan mobile number formats
      if (!phoneRegex.test(cleanedNumber)) {
        newErrors.contactNumber =
          "Please enter a valid mobile number (07XXXXXXXX)";
      } else {
        // Additional length checks
        if (cleanedNumber.startsWith("94") && cleanedNumber.length !== 11) {
          newErrors.contactNumber =
            "International format must be 11 digits (947XXXXXXXX)";
        } else if (
          cleanedNumber.startsWith("0") &&
          cleanedNumber.length !== 10
        ) {
          newErrors.contactNumber =
            "Local numbers must be 10 digits (07XXXXXXXX)";
        } else if (!/^(94|0|)\d+$/.test(cleanedNumber)) {
          newErrors.contactNumber = "Number must start with 0 or 94";
        }
      }
    }

    // Avatar validation
    if (!formData.avatar) {
      newErrors.avatar = "Profile picture is required";
    } else if (formData.avatar.size > 2 * 1024 * 1024) {
      // 2MB limit
      newErrors.avatar = "Image size must be less than 2MB";
    } else if (!formData.avatar.type.match("image.*")) {
      newErrors.avatar = "Only image files are allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, avatar: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    const formDataToSend = new FormData();
    // Don't include confirmPassword in the form data sent to the server
    const { confirmPassword, ...dataToSend } = formData;
    Object.keys(dataToSend).forEach((key) => {
      formDataToSend.append(key, dataToSend[key]);
    });

    try {
      const response = await fetch("http://localhost:8080/api/user/register", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error(data.message);

      toast.success("Registration successful!");
      // Reset form after successful registration
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        gender: "",
        contactNumber: "",
        avatar: null,
      });
      setPreview(null);
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              Create Your Account
            </h2>
            <p className="text-blue-100 mt-1">Join our community today</p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    maxLength="50"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    maxLength="50"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase,
                  number, and special character
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserCircle className="text-gray-400" />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.contactNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Avatar Upload */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Profile Picture <span className="text-red-500">*</span>
                </label>
                <div
                  className={`mt-1 relative flex flex-col items-center justify-center w-full h-40 border-2 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${
                    errors.avatar
                      ? "border-red-500"
                      : "border-dashed border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {preview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={preview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <FaUpload className="text-white text-2xl" />
                        <span className="text-white ml-2">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag & drop your photo here, or click to select
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended size: 500x500px (Max 2MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                {errors.avatar && (
                  <p className="mt-1 text-sm text-red-500">{errors.avatar}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Creating Account...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

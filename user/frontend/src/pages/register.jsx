import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaUserCircle,
  FaUpload,
  FaSignInAlt,
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

  // New function to validate a single field
  const validateField = (name, value) => {
    // Regular expressions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:\+94|0|94)?(?:7[01245678])(?:\d{7})$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    let errorMessage = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) {
          errorMessage = "First name is required";
        } else if (value.length < 2) {
          errorMessage = "First name must be at least 2 characters";
        } else if (value.length > 50) {
          errorMessage = "First name must be less than 50 characters";
        }
        break;

      case "lastName":
        if (!value.trim()) {
          errorMessage = "Last name is required";
        } else if (value.length < 2) {
          errorMessage = "Last name must be at least 2 characters";
        } else if (value.length > 50) {
          errorMessage = "Last name must be less than 50 characters";
        }
        break;

      case "email":
        if (!value.trim()) {
          errorMessage = "Email is required";
        } else if (!emailRegex.test(value)) {
          errorMessage = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          errorMessage = "Password is required";
        } else if (!passwordRegex.test(value)) {
          errorMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
        }
        break;

      case "confirmPassword":
        if (!value) {
          errorMessage = "Please confirm your password";
        } else if (value !== formData.password) {
          errorMessage = "Passwords do not match";
        }
        break;

      case "gender":
        if (!value) {
          errorMessage = "Gender is required";
        }
        break;

      case "contactNumber":
        if (!value.trim()) {
          errorMessage = "Contact number is required";
        } else {
          // Remove all non-digit characters
          const cleanedNumber = value.replace(/\D/g, "");
          
          // Check max length first
          if (cleanedNumber.startsWith("94") && cleanedNumber.length > 11) {
            errorMessage = "Sri Lankan international format number cannot exceed 11 digits";
          } else if (!cleanedNumber.startsWith("94") && cleanedNumber.length > 10) {
            errorMessage = "Sri Lankan local number cannot exceed 10 digits";
          }
          // Then validate format
          else if (!phoneRegex.test(cleanedNumber)) {
            errorMessage = "Please enter a valid mobile number (07XXXXXXXX)";
          } else {
            // Additional length checks
            if (cleanedNumber.startsWith("94") && cleanedNumber.length !== 11) {
              errorMessage = "International format must be exactly 11 digits (947XXXXXXXX)";
            } else if (cleanedNumber.startsWith("0") && cleanedNumber.length !== 10) {
              errorMessage = "Local numbers must be exactly 10 digits (07XXXXXXXX)";
            } else if (!/^(94|0|)\d+$/.test(cleanedNumber)) {
              errorMessage = "Number must start with 0 or 94";
            }
          }
        }
        break;

      case "avatar":
        if (!value) {
          errorMessage = "Profile picture is required";
        } else if (value.size > 2 * 1024 * 1024) { // 2MB limit
          errorMessage = "Image size must be less than 2MB";
        } else if (!value.type.match("image.*")) {
          errorMessage = "Only image files are allowed";
        }
        break;

      default:
        break;
    }

    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    let newValue;
    if (type === "file" && files[0]) {
      newValue = files[0];
      setPreview(URL.createObjectURL(files[0]));
    } else {
      newValue = value;
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate the field
    const errorMessage = validateField(name, newValue);
    
    // Special case for confirmPassword - validate again if password changes
    if (name === "password" && formData.confirmPassword) {
      const confirmPasswordError = formData.confirmPassword !== value ? 
        "Passwords do not match" : "";
      
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage,
        confirmPassword: confirmPasswordError
      }));
    } else {
      // Update errors for the current field
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  // Update validateForm to use validateField for consistency
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate each field
    Object.entries(formData).forEach(([fieldName, fieldValue]) => {
      const errorMessage = validateField(fieldName, fieldValue);
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
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
                    maxLength="10" // Add this attribute for local format
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

              {/* Action Buttons */}
              <div className="col-span-1 md:col-span-2 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Register Button */}
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
                  
                  {/* Login Button */}
                  <a 
                    href="/login"
                    className="w-full flex items-center justify-center py-3 px-4 border border-blue-500 rounded-lg shadow-sm text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  >
                    <FaSignInAlt className="mr-2" />
                    Login
                  </a>
                </div>
              </div>
            </form>
            
            {/* Optional Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

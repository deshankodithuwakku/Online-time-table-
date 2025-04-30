import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function
       
  // Add phone validation function
  const validatePhoneNumber = (phone) => {
    // Check if the phone starts with 0 and contains only digits
    const validFormat = /^0\d*$/.test(phone);
    
    // Check if length is maximum 10 digits
    const validLength = phone.length <= 10;      
    
    // Check if it starts with 0
    const startsWithZero = phone.startsWith('0');
    
    return validFormat && validLength && startsWithZero;
  };

  const validateForm = () => {
    const newErrors = {};

    // Regular expressions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|94|\+94)?(7[0-9])([0-9]{7})$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
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
        "Password must contain at least 8 characters, including uppercase, lowercase, number and special character";
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

    // Contact Number validation - updated
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!formData.contactNumber.startsWith('0')) {
      newErrors.contactNumber = "Number must start with 0";
    } else if (!validatePhoneNumber(formData.contactNumber) || formData.contactNumber.length !== 10) {
      newErrors.contactNumber = "Please enter a valid 10-digit phone number starting with 0";
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
    } 
    // Handle contact number validation
    else if (name === 'contactNumber') {
      // Only allow digits, and ensure it starts with 0
      const newValue = value.replace(/[^\d]/g, '');
      
      // If empty or starts with 0, update the value
      if (newValue === '' || newValue.startsWith('0')) {
        setFormData({ 
          ...formData, 
          [name]: newValue.substring(0, 10) // Limit to 10 digits
        });
      } else if (newValue !== '') {
        // If there's input but doesn't start with 0, force it to start with 0
        setFormData({ 
          ...formData, 
          [name]: '0' + newValue.substring(0, 9) // Add 0 at beginning and limit to total 10 digits
        });
      }
      
      // Validate and set appropriate error message
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, contactNumber: "Contact number is required" }));
      } else if (!value.startsWith('0')) {
        setErrors(prev => ({ ...prev, contactNumber: "Number must start with 0" }));
      } else if (!validatePhoneNumber(value)) {
        setErrors(prev => ({ 
          ...prev, 
          contactNumber: "Please enter a valid phone number (10 digits starting with 0)" 
        }));
      } else {
        setErrors(prev => ({ ...prev, contactNumber: null }));
      }
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
      if (!response.ok) throw new Error(data.message);
      toast.success("Registration Successful");

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
      
      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      setErrors({ ...errors, form: err.message || "Something went wrong" });
      toast.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl self-center font-bold text-center mb-6 text-gray-700">
          Register
        </h2>
        {errors.form && (
          <p className="text-red-500 text-center mb-4">{errors.form}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
          encType="multipart/form-data"
        >
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.contactNumber ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* Avatar Upload */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload Avatar <span className="text-red-500">*</span>
            </label>
            <div
              className={`mt-2 relative flex flex-col items-center justify-center w-full h-40 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${
                errors.avatar
                  ? "border-2 border-red-500"
                  : "border-2 border-dashed border-gray-300 hover:border-blue-400"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="h-full object-cover rounded-md"
                />
              ) : (
                <p className="text-gray-400">Drag & Drop or Click to Upload</p>
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
            <p className="text-xs text-gray-500 mt-1">Max file size: 2MB</p>
          </div>

          {/* Submit Button */}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
            >
              Register
            </button>
          </div>
          
          {/* Login Option */}
          <div className="col-span-2 mt-6 text-center border-t pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;

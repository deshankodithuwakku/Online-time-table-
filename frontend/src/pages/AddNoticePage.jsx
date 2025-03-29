import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Configure axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const AddNoticePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    noticeDate: new Date(),
    priority: "medium",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length > 2000) {
      newErrors.content = "Content must be less than 2000 characters";
    }

    if (!formData.noticeDate) {
      newErrors.noticeDate = "Date is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      noticeDate: date,
    }));

    if (errors.noticeDate) {
      setErrors((prev) => ({
        ...prev,
        noticeDate: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission initiated");

    if (!validateForm()) {
      console.warn("Form validation failed", errors);
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting notice:", formData);
      const response = await api.post("/admin/addnotice", {
        ...formData,
        noticeDate: formData.noticeDate.toISOString(),
      });

      console.log("Notice created successfully:", response.data);
      toast.success("Notice added successfully");
      navigate("/notices");
    } catch (error) {
      console.error("Submission error:", error);

      if (error.code === "ERR_NETWORK") {
        toast.error("Network error: Could not connect to server");
        toast.error("Please check if the backend is running on port 8080");
      } else if (error.response) {
        // Handle server validation errors
        if (error.response.data?.errors) {
          const serverErrors = error.response.data.errors.reduce((acc, err) => {
            if (err.field) {
              acc[err.field] = err.message;
            }
            return acc;
          }, {});
          setErrors(serverErrors);
        }
        toast.error(error.response.data?.message || "Server error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Notice</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter notice title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Content Field */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.content ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter notice content"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        {/* Notice Date Field */}
        <div>
          <label
            htmlFor="noticeDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notice Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={formData.noticeDate}
            onChange={handleDateChange}
            minDate={new Date()}
            dateFormat="MMMM d, yyyy"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.noticeDate ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.noticeDate && (
            <p className="mt-1 text-sm text-red-500">{errors.noticeDate}</p>
          )}
        </div>

        {/* Priority Field */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.priority ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
          )}
        </div>

        {/* Status Field */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.status ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate("/notices")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Processing...
              </span>
            ) : (
              "Add Notice"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNoticePage;

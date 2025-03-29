import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FiClock,
  FiCalendar,
  FiBook,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";

const TeacherRequestsView = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { id } = useParams(); // Changed from teacherId to id to match your route

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        // const response = await fetch(`/api/getteacherrequests/${id}`);
        const response = await fetch(
          "http://localhost:8080/api/admin/getteacherrequests/67e0502dda8114cce6c68688",
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }
        const data = await response.json();
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        setRequests(data);
      } catch (error) {
        console.error("Failed to load requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [id]);

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  const statusConfig = {
    approved: {
      icon: <FiCheckCircle className="text-green-500" />,
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
    rejected: {
      icon: <FiXCircle className="text-red-500" />,
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },
    pending: {
      icon: <FiAlertCircle className="text-yellow-500" />,
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
  };

  const refreshRequests = () => {
    setLoading(true);
    fetch(`/api/getteacherrequests/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error refreshing requests:", error);
        setLoading(false);
      });
  };
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Requests
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage your schedule requests
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={refreshRequests}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow px-4 py-3">
        <div className="flex items-center">
          <FiFilter className="text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-500 mr-4">
            Filter by:
          </span>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden text-center py-12">
          <div className="max-w-md mx-auto">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No requests found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all"
                ? "You haven't made any schedule requests yet."
                : `No ${filter} requests found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-white rounded-lg shadow overflow-hidden border-l-4 ${
                statusConfig[request.status]?.border || "border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Left side - Course and description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusConfig[request.status]?.bg
                        } ${statusConfig[request.status]?.text}`}
                      >
                        {statusConfig[request.status]?.icon}
                        <span className="ml-1 capitalize">
                          {request.status}
                        </span>
                      </span>
                      <span className="ml-3 text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {request.course?.name || "No course specified"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {request.description || "No description provided"}
                    </p>
                  </div>

                  {/* Right side - Date and time */}
                  <div className="mt-4 md:mt-0 md:ml-6 md:text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(request.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center justify-center md:justify-end mt-1 text-gray-600">
                      <FiClock className="mr-1.5 h-4 w-4" />
                      <span className="text-sm">
                        {formatTime(request.startTime)} -
                        {formatTime(request.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <FiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span className="truncate">
                      Venue: {request.venue || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>Duration: {request.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <FiBook className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>Course Code: {request.course?.code || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500">ID: {request.id}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {request.status === "pending" && (
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200">
                  <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md">
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherRequestsView;

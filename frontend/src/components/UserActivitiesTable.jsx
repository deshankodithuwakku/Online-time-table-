import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserActivitiesTable = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.userId) query.append("userId", filters.userId);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);

      const response = await fetch(
        `http://localhost:8080/api/admin/allusersactivitys?${query.toString()}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch activities");

      setActivities(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const query = new URLSearchParams();
      if (filters.userId) query.append("userId", filters.userId);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);
      query.append("download", format);

      const response = await fetch(
        `http://localhost:8080/api/admin/allusersactivitys?${query.toString()}`,
        {
          credentials: "include",
        }
      );
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user_activities.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else if (format === "pdf") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (err) {
      toast.error(`Failed to download: ${err.message}`);
    }
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-xl overflow-x-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          User Activities
        </h2>
        <div className="flex space-x-2">
          {/* <button
            onClick={() => handleDownload("pdf")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Download PDF
          </button> */}
          <button
            onClick={() => handleDownload("csv")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Filter by user ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
      <button
        onClick={fetchActivities}
        className="px-4 py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Apply Filters
      </button>

      {/* Activities Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
            <th className="px-4 py-3">Activity</th>
            {/* <th className="px-4 py-3">User</th> */}
            <th className="px-4 py-3">User ID</th>
            <th className="px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr
              key={activity.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{activity.activity}</td>
              {/* <td className="px-4 py-3">
                {activity.user
                  ? `${activity.user.firstName} ${activity.user.lastName}`
                  : "N/A"}
              </td> */}
              <td className="px-4 py-3">{activity.userId}</td>
              <td className="px-4 py-3">
                {new Date(activity.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserActivitiesTable;

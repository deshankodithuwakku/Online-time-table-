// components/admin/RequestList.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/getpendingrequests",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (response.ok) {
          setRequests(data);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleProcessRequest = async (requestId, action) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/processrequest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, action }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        toast.success(data.message);
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pending Schedule Requests</h2>

      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {request.teacher.firstName} {request.teacher.lastName} -{" "}
                    {request.course.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(request.date).toLocaleDateString()} |
                    {new Date(request.startTime).toLocaleTimeString()} -
                    {new Date(request.endTime).toLocaleTimeString()} |
                    {request.venue}
                  </p>
                  {request.description && (
                    <p className="mt-2 text-sm">{request.description}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleProcessRequest(request.id, "approve")}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleProcessRequest(request.id, "reject")}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestList;

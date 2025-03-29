import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const NoticeTable = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // Check connection first
        const response = await axios.get("http://localhost:4000/api/admin/getallnotices", {
          withCredentials: true,
          timeout: 5000 // Set a timeout to avoid long waits
        });
        
        setNotices(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching notices:", error);
        
        // More specific error handling
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          setError("Cannot connect to the server. Please make sure the backend server is running.");
          toast.error("Server connection failed. Is the backend server running?");
        } else if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Server error: ${error.response.data.message || error.response.statusText}`);
          toast.error(`Server error: ${error.response.data.message || "Unknown error"}`);
        } else {
          setError("An unexpected error occurred");
          toast.error("Failed to load notices: " + (error.message || "Unknown error"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        // Updated port from 8080 to 4000
        await axios.post(
          "http://localhost:4000/api/admin/deletenotice", 
          { id },
          { withCredentials: true }
        );
        setNotices(notices.filter(notice => notice.id !== id));
        toast.success("Notice deleted successfully");
      } catch (error) {
        console.error("Error deleting notice:", error);
        toast.error("Failed to delete notice: " + (error.response?.data?.message || "Server error"));
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading notices...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notices</h2>
        <Link
          to="/addnotice"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Notice
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-left">Content</th>
              <th className="py-3 px-6 text-center">Date Posted</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <tr key={notice.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {notice.title}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {notice.content.length > 50
                      ? `${notice.content.substring(0, 50)}...`
                      : notice.content}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <Link
                        to={`/noticedetails/${notice.id}`}
                        className="transform hover:text-blue-500 hover:scale-110 mr-3"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="transform hover:text-red-500 hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center">
                  No notices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoticeTable;

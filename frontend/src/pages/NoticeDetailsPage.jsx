import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const NoticeDetailsPage = () => {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchNoticeDetails = async () => {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/admin/getnotice",
          { id },
          { withCredentials: true }
        );
        setNotice(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notice details:", error);
        toast.error("Failed to load notice details");
        setLoading(false);
      }
    };

    fetchNoticeDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10">Loading notice details...</div>;
  }

  if (!notice) {
    return <div className="text-center mt-10">Notice not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{notice.title}</h1>
          <div className="text-sm text-gray-600 mb-6">
            Posted on: {new Date(notice.createdAt).toLocaleString()}
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{notice.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailsPage;

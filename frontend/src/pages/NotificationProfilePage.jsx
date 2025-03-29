import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const NotificationProfilePage = () => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/admin/getnotification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (response.ok) {
          setNotification(data);
        } else {
          setError(data.message || "Failed to load notification");
        }
        setLoading(false);
      } catch (err) {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    };

    fetchNotificationData();
  }, [id]);

  if (loading)
    return <div className="text-center text-lg font-medium">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 text-lg">{error}</div>;
  if (!notification)
    return <div className="text-center text-lg">Notification not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-yellow-100 flex items-center justify-center shadow-md mb-4">
            <svg
              className="w-14 h-14 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">{notification.title}</h1>
          <span
            className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              notification.recipientType === "all"
                ? "bg-purple-100 text-purple-800"
                : notification.recipientType === "students"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {notification.recipientType}
          </span>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Notification Details
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Message:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {notification.message}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Created At:</h3>
                <p className="text-gray-600">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Recipients:</h3>
                <p className="text-gray-600 capitalize">
                  {notification.recipientType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationProfilePage;

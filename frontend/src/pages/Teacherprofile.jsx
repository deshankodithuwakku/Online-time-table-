import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const TeacherProfilePage = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams(); // Get the dynamic route parameter 'id'

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/admin/getteacher/${id}`,
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
          setTeacher(data.users); // Access 'users' directly as it's returned from the backend
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
        setLoading(false);
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  if (loading)
    return <div className="text-center text-lg font-medium">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        {/* Teacher Profile Header */}
        <div className="flex flex-col items-center">
          <img
            src={teacher.avatar || "https://via.placeholder.com/150"}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-gray-300 shadow-md"
          />
          <h1 className="text-3xl font-bold mt-4">{`${teacher.firstName} ${teacher.lastName}`}</h1>
          <p className="text-lg text-gray-600">{teacher.email}</p>
          <p className="text-gray-500">{`Contact: ${teacher.contactNumber}`}</p>
          <span
            className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              teacher.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {teacher.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Teacher Profile Information */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Profile Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600">{teacher.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Contact:</span>
              <span className="text-gray-600">{teacher.contactNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Status:</span>
              <span
                className={`text-sm font-semibold ${
                  teacher.status === "active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {teacher.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;

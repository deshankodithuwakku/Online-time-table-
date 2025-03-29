import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CourseProfilePage = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/admin/getcoursedetails`,
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
          setCourse(data.data);
        } else {
          setError(data.message || "Failed to load course data");
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Network error. Please try again.");
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  if (loading)
    return (
      <div className="text-center text-lg font-medium">
        Loading course details...
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 text-lg">{error}</div>;
  if (!course)
    return <div className="text-center text-lg">Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        {/* Course Header */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
            <svg
              className="w-14 h-14 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mt-4">{course.name}</h1>
          <p className="text-gray-500">Course ID: {course.id}</p>
        </div>

        {/* Course Information */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Course Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Course ID:</span>
              <span className="text-gray-600">{course.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Course Name:</span>
              <span className="text-gray-600">{course.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700 mb-1">
                Description:
              </span>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {course.description || "No description available"}
              </p>
            </div>

            {/* Teachers Section */}
            <div className="flex flex-col mt-4">
              <span className="font-semibold text-gray-700 mb-2">
                Assigned Teachers:
              </span>
              {course.teachers && course.teachers.length > 0 ? (
                <div className="bg-gray-50 p-3 rounded">
                  {course.teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center py-2 border-b last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-600">
                          {teacher.firstName.charAt(0)}
                          {teacher.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 bg-gray-50 p-3 rounded">
                  No teachers assigned to this course
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProfilePage;

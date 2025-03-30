import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/admin/getuser/${id}`,
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
          setUser(data.users);
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
        setLoading(false);
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true);
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text("User Profile", 105, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.text("Personal Information", 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 50);
      doc.text(`Email: ${user.email}`, 20, 60);
      doc.text(`Contact: ${user.contactNumber}`, 20, 70);
      doc.text(`Status: ${user.status}`, 20, 80);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 100);
      
      doc.save(`user_profile_${user.firstName}_${user.lastName}.pdf`);
      
      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF: " + (err.message || "Unknown error"));
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading)
    return <div className="text-center text-lg font-medium">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <div className="flex flex-col items-center">
          <img
            src={user.avatar || "https://via.placeholder.com/150"}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-gray-300 shadow-md"
          />
          <h1 className="text-3xl font-bold mt-4">{`${user.firstName} ${user.lastName}`}</h1>
          <p className="text-lg text-gray-600">{user.email}</p>
          <p className="text-gray-500">{`Contact: ${user.contactNumber}`}</p>
          <span
            className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              user.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user.status === "active" ? "Active" : "Inactive"}
          </span>
          
          <button
            onClick={handleGeneratePDF}
            disabled={pdfLoading}
            className={`mt-4 px-4 py-2 rounded-md text-white font-medium ${
              pdfLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } transition flex items-center justify-center`}
          >
            {pdfLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                Generating PDF...
              </>
            ) : (
              "Generate PDF Profile"
            )}
          </button>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Profile Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-700">Contact:</span>
              <span className="text-gray-600">{user.contactNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Status:</span>
              <span
                className={`text-sm font-semibold ${
                  user.status === "active" ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

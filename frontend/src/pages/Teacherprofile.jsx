import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

const TeacherProfilePage = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { id } = useParams();

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
          setTeacher(data.users);
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

  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true);
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text("Teacher Profile", 105, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.text("Personal Information", 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Name: ${teacher.firstName} ${teacher.lastName}`, 20, 50);
      doc.text(`Email: ${teacher.email}`, 20, 60);
      doc.text(`Contact: ${teacher.contactNumber || "Not provided"}`, 20, 70);
      doc.text(`Status: ${teacher.status}`, 20, 80);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 100);
      
      doc.save(`teacher_profile_${teacher.firstName}_${teacher.lastName}.pdf`);
      
      toast.success("PDF generated successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF");
      console.error("PDF generation error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading teacher data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!teacher) return <div className="text-center py-4">Teacher not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Profile</h1>
          <button
            onClick={handleGeneratePDF}
            disabled={pdfLoading}
            className={`bg-white text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-md ${
              pdfLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {pdfLoading ? "Generating PDF..." : "Generate PDF"}
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img
                src={`http://localhost:8080${teacher.avatar}`}
                alt="Teacher Avatar"
                className="rounded-full w-48 h-48 object-cover mx-auto border-4 border-gray-200"
              />
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{`${teacher.firstName} ${teacher.lastName}`}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{teacher.email}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium">{teacher.contactNumber || "Not provided"}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${teacher.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {teacher.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;

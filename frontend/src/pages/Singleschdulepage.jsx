import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

const ScheduleDetailsPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    teacherId: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    duration: 0,                      
    description: "",
    recipientType: "all",
  });
  const [pdfLoading, setPdfLoading] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/admin/getsingleschedule/${id}`,
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
          setSchedule(data.schedule);
          // Pre-fill form data
          setFormData({
            courseId: data.schedule.courseId || "",
            teacherId: data.schedule.teacherId || "",
            date: data.schedule.date ? data.schedule.date.split('T')[0] : "",
            startTime: data.schedule.startTime ? data.schedule.startTime.split('T')[1].substring(0, 5) : "",
            endTime: data.schedule.endTime ? data.schedule.endTime.split('T')[1].substring(0, 5) : "",
            venue: data.schedule.venue || "",
            duration: data.schedule.duration || 0,
            description: data.schedule.description || "",
            recipientType: data.schedule.recipientType || "all",
          });
        } else {
          setError(data.message || "Failed to fetch schedule details");
        }
        setLoading(false);
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [id]);

  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true);
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text("Schedule Details", 105, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.text("Schedule Information", 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Course: ${schedule.course ? schedule.course.name : 'N/A'}`, 20, 50);
      doc.text(`Date: ${new Date(schedule.date).toLocaleDateString()}`, 20, 60);
      doc.text(`Time: ${schedule.startTime.split('T')[1].substring(0, 5)} - ${schedule.endTime.split('T')[1].substring(0, 5)}`, 20, 70);
      doc.text(`Venue: ${schedule.venue}`, 20, 80);
      doc.text(`Duration: ${schedule.duration} minutes`, 20, 90);
      doc.text(`Teacher: ${schedule.teacher ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` : 'N/A'}`, 20, 100);
      
      doc.setFontSize(14);
      doc.text("Description:", 20, 120);
      doc.setFontSize(11);
      
      // Wrap long description text
      const splitText = doc.splitTextToSize(schedule.description || 'No description provided', 170);
      doc.text(splitText, 20, 130);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 200);
      
      doc.save(`schedule_details_${id}.pdf`);
      
      toast.success("PDF generated successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF");
      console.error("PDF generation error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading schedule data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!schedule) return <div className="text-center py-4">Schedule not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Schedule Details</h1>
          <button
            onClick={handleGeneratePDF}
            disabled={pdfLoading}
            className={`bg-white text-green-600 hover:bg-green-100 px-4 py-2 rounded-md ${
              pdfLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {pdfLoading ? "Generating PDF..." : "Generate PDF"}
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Course Information</h2>
              <p className="mb-2"><span className="font-medium">Course Name:</span> {schedule.course ? schedule.course.name : 'N/A'}</p>
              <p className="mb-2"><span className="font-medium">Teacher:</span> {schedule.teacher ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` : 'N/A'}</p>
              <p className="mb-2"><span className="font-medium">Recipient Type:</span> {schedule.recipientType}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Schedule Details</h2>
              <p className="mb-2"><span className="font-medium">Date:</span> {new Date(schedule.date).toLocaleDateString()}</p>
              <p className="mb-2"><span className="font-medium">Start Time:</span> {schedule.startTime.split('T')[1].substring(0, 5)}</p>
              <p className="mb-2"><span className="font-medium">End Time:</span> {schedule.endTime.split('T')[1].substring(0, 5)}</p>
              <p className="mb-2"><span className="font-medium">Duration:</span> {schedule.duration} minutes</p>
              <p className="mb-2"><span className="font-medium">Venue:</span> {schedule.venue}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{schedule.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsPage;

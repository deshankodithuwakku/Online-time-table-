import { useState } from "react";
import { toast } from "react-toastify";

const AssignScheduleForm = () => {
  const [formData, setFormData] = useState({
    id: "",
    courseName: "",
    assignedTeacherIds: [],
    recipientType: "",
  });

  const [teachers, setTeachers] = useState([]); // To store available teachers (fetched from API)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeacherChange = (e) => {
    const { options } = e.target;
    const selectedTeachers = [];
    for (let i = 0, len = options.length; i < len; i++) {
      if (options[i].selected) {
        selectedTeachers.push(options[i].value);
      }
    }
    setFormData({ ...formData, assignedTeacherIds: selectedTeachers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/assignschedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
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
        setFormData({
          id: "",
          courseName: "",
          assignedTeacherIds: [],
          recipientType: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error:", error);
    }
  };
  console.log(object);
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-lg shadow-md"
    >
      {/* Left Column */}
      <div className="space-y-4">
        <div>
          <label className="block">Schedule ID</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block">Course Name</label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block">Assign Teachers</label>
          <select
            multiple
            name="assignedTeacherIds"
            value={formData.assignedTeacherIds}
            onChange={handleTeacherChange}
            className="border p-2 w-full rounded"
            required
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div>
          <label className="block">Recipient Type</label>
          <select
            name="recipientType"
            value={formData.recipientType}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Full Width Button */}
      <div className="col-span-1 md:col-span-2">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Assign Teacher
        </button>
      </div>
    </form>
  );
};

export default AssignScheduleForm;

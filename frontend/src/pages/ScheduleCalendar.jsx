// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";

// const ScheduleCalendarWithForm = () => {
//   // Calendar state
//   const [events, setEvents] = useState([]);
//   const [showFormModal, setShowFormModal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);

//   // Form state
//   const [courses, setCourses] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState({
//     courses: false,
//     teachers: false,
//   });
//   const [formData, setFormData] = useState({
//     scheduleId: "",
//     courseId: "",
//     date: "",
//     startTime: "",
//     endTime: "",
//     venue: "",
//     duration: "",
//     description: "",
//     teacherId: "",
//     recipientType: "student",
//   });

//   // Fetch initial data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch courses
//         setLoading((prev) => ({ ...prev, courses: true }));
//         const coursesResponse = await fetch(
//           "http://localhost:8080/api/admin/allcourses",
//           { credentials: "include" }
//         );
//         const coursesData = await coursesResponse.json();
//         if (coursesResponse.status === 401) {
//           window.location.href = "/login";
//           return;
//         }
//         if (coursesResponse.ok) setCourses(coursesData.data);

//         // Fetch teachers
//         setLoading((prev) => ({ ...prev, teachers: true }));
//         const teachersResponse = await fetch(
//           "http://localhost:8080/api/admin/getallteachers",
//           { credentials: "include" }
//         );
//         const teachersData = await teachersResponse.json();
//         if (teachersResponse.status === 401) {
//           window.location.href = "/login";
//           return;
//         }
//         if (teachersResponse.ok) setTeachers(teachersData.data || []);

//         // Fetch schedules
//         const schedulesResponse = await fetch(
//           "http://localhost:8080/api/admin/getallschedule",
//           { credentials: "include" }
//         );
//         const schedulesData = await schedulesResponse.json();
//         if (schedulesResponse.status === 401) {
//           window.location.href = "/login";
//           return;
//         }
//         if (schedulesResponse.ok) {
//           const formattedEvents = schedulesData.data.map((schedule) => ({
//             id: schedule.id,
//             title: `${schedule.course?.name || "Untitled"} (${schedule.venue})`,
//             start: schedule.startTime,
//             end: schedule.endTime,
//             extendedProps: {
//               ...schedule,
//             },
//           }));
//           setEvents(formattedEvents);
//         }
//       } catch (error) {
//         toast.error(error.message);
//       } finally {
//         setLoading({ courses: false, teachers: false });
//       }
//     };

//     fetchData();
//   }, []);

//   // Calendar date click handler
//   const handleDateClick = (arg) => {
//     const dateStr = arg.dateStr;
//     setSelectedDate(dateStr);
//     setFormData({
//       scheduleId: "",
//       courseId: "",
//       date: dateStr,
//       startTime: "09:00",
//       endTime: "10:00",
//       venue: "",
//       duration: "",
//       description: "",
//       teacherId: "",
//       recipientType: "student",
//     });
//     setShowFormModal(true);
//   };

//   // Calendar event click handler
//   const handleEventClick = (info) => {
//     const event = info.event;
//     setFormData({
//       scheduleId: event.id,
//       courseId: event.extendedProps.courseId,
//       date: event.startStr.split("T")[0],
//       startTime: event.startStr.split("T")[1].substring(0, 5),
//       endTime: event.endStr.split("T")[1].substring(0, 5),
//       venue: event.extendedProps.venue,
//       duration: event.extendedProps.duration?.toString() || "",
//       description: event.extendedProps.description || "",
//       teacherId: event.extendedProps.teacherId,
//       recipientType: event.extendedProps.recipientType || "student",
//     });
//     setShowFormModal(true);
//   };

//   // Form change handler
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Form submit handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const url = formData.scheduleId
//         ? "http://localhost:8080/api/admin/updateschedule"
//         : "http://localhost:8080/api/admin/addschedule";

//       const payload = {
//         ...(formData.scheduleId && { id: formData.scheduleId }),
//         courseId: formData.courseId,
//         date: formData.date,
//         startTime: formData.startTime,
//         endTime: formData.endTime,
//         venue: formData.venue,
//         duration: formData.duration,
//         description: formData.description,
//         teacherId: formData.teacherId,
//         recipientType: formData.recipientType,
//       };

//       const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//         credentials: "include",
//       });

//       const data = await response.json();
//       if (response.ok) {
//         toast.success(data.message);
//         resetForm();
//         refreshCalendar();
//       } else {
//         throw new Error(data.message || "Operation failed");
//       }
//     } catch (error) {
//       toast.error(error.message);
//       console.error("Error:", error);
//     }
//   };

//   // Handle event deletion
//   const handleDeleteEvent = async () => {
//     try {
//       const response = await fetch(
//         "http://localhost:8080/api/admin/deleteschedule",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id: formData.scheduleId }),
//           credentials: "include",
//         }
//       );

//       const data = await response.json();
//       if (response.status === 401) {
//         window.location.href = "/login";
//         return;
//       }
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to delete schedule");
//       }

//       toast.success(data.message);
//       resetForm();
//       refreshCalendar();
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Helper function to reset form
//   const resetForm = () => {
//     setFormData({
//       scheduleId: "",
//       courseId: "",
//       date: "",
//       startTime: "",
//       endTime: "",
//       venue: "",
//       duration: "",
//       description: "",
//       teacherId: "",
//       recipientType: "student",
//     });
//     setShowFormModal(false);
//   };

//   // Helper function to refresh calendar data
//   const refreshCalendar = async () => {
//     try {
//       const schedulesResponse = await fetch(
//         "http://localhost:8080/api/admin/getallschedule",
//         { credentials: "include" }
//       );
//       const schedulesData = await schedulesResponse.json();
//       if (schedulesResponse.status === 401) {
//         window.location.href = "/login";
//         return;
//       }
//       if (schedulesResponse.ok) {
//         const formattedEvents = schedulesData.data.map((schedule) => ({
//           id: schedule.id,
//           title: `${schedule.course?.name || "Untitled"} (${schedule.venue})`,
//           start: schedule.startTime,
//           end: schedule.endTime,
//           extendedProps: {
//             ...schedule,
//           },
//         }));
//         setEvents(formattedEvents);
//       }
//     } catch (error) {
//       console.error("Error refreshing calendar:", error);
//     }
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
//           <h2 className="text-3xl font-bold text-gray-800 mb-2">
//             Schedule Calendar
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Manage and view your teaching schedules
//           </p>

//           {/* Calendar Component */}
//           <div className="border border-gray-200 rounded-xl overflow-hidden">
//             <FullCalendar
//               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//               initialView="timeGridWeek"
//               headerToolbar={{
//                 left: "prev,next today",
//                 center: "title",
//                 right: "dayGridMonth,timeGridWeek,timeGridDay",
//               }}
//               events={events}
//               editable={true}
//               selectable={true}
//               dateClick={handleDateClick}
//               eventClick={handleEventClick}
//               height={700}
//               eventContent={(eventInfo) => (
//                 <div className="fc-event-content p-2">
//                   <div className="font-semibold text-sm text-white">
//                     {eventInfo.event.title.split(" (")[0]}
//                   </div>
//                   <div className="text-xs text-white opacity-90">
//                     {eventInfo.timeText} • {eventInfo.event.extendedProps.venue}
//                   </div>
//                 </div>
//               )}
//               eventClassNames="border-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
//               dayHeaderClassNames="bg-gray-50 text-gray-700 font-medium"
//               buttonText={{
//                 today: "Today",
//                 month: "Month",
//                 week: "Week",
//                 day: "Day",
//               }}
//               nowIndicatorClassNames="bg-red-500 h-1"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Schedule Form Modal */}
//       {showFormModal && (
//         <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-xl font-bold text-gray-800">
//                 {formData.scheduleId ? "Edit Schedule" : "Create New Schedule"}
//               </h2>
//               <button
//                 onClick={() => setShowFormModal(false)}
//                 className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Left Column */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Course
//                     </label>
//                     <select
//                       name="courseId"
//                       value={formData.courseId}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                       disabled={loading.courses}
//                     >
//                       <option value="">Select a course</option>
//                       {courses.map((course) => (
//                         <option key={course.id} value={course.id}>
//                           {course.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Teacher
//                     </label>
//                     <select
//                       name="teacherId"
//                       value={formData.teacherId}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                       disabled={loading.teachers}
//                     >
//                       <option value="">Select a teacher</option>
//                       {teachers.map((teacher) => (
//                         <option key={teacher.id} value={teacher.id}>
//                           {teacher.firstName} {teacher.lastName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={formData.date}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Start Time
//                     </label>
//                     <input
//                       type="time"
//                       name="startTime"
//                       value={formData.startTime}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Right Column */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Recipient Type
//                     </label>
//                     <select
//                       name="recipientType"
//                       value={formData.recipientType}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     >
//                       <option value="student">Students</option>
//                       <option value="teacher">Teachers</option>
//                       <option value="all">All</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Venue
//                     </label>
//                     <input
//                       type="text"
//                       name="venue"
//                       value={formData.venue}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Duration (minutes)
//                     </label>
//                     <input
//                       type="number"
//                       name="duration"
//                       value={formData.duration}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       End Time
//                     </label>
//                     <input
//                       type="time"
//                       name="endTime"
//                       value={formData.endTime}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Full Width Fields */}
//               <div className="mt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows={3}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* Submit and Delete Buttons */}
//               <div className="mt-6 flex justify-end space-x-3">
//                 {formData.scheduleId && (
//                   <button
//                     type="button"
//                     onClick={handleDeleteEvent}
//                     className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//                   >
//                     Delete
//                   </button>
//                 )}
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//                 >
//                   {formData.scheduleId ? "Update" : "Create"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ScheduleCalendarWithForm;

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const ScheduleCalendarWithForm = () => {
  // Calendar state
  const [events, setEvents] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});

  // Form state
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState({
    courses: false,
    teachers: false,
  });
  const [formData, setFormData] = useState({
    scheduleId: "",
    courseId: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    duration: "",
    description: "",
    teacherId: "",
    recipientType: "student",
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    if (!formData.teacherId) {
      newErrors.teacherId = "Please select a teacher";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else if (new Date(formData.date) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.date = "Date cannot be in the past";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Please select a start time";
    }

    if (!formData.endTime) {
      newErrors.endTime = "Please select an end time";
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!formData.venue) {
      newErrors.venue = "Please enter a venue";
    }

    if (!formData.duration) {
      newErrors.duration = "Please enter duration";
    } else if (isNaN(formData.duration)) {
      newErrors.duration = "Duration must be a number";
    }

    if (!formData.description) {
      newErrors.description = "Please enter a description";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        setLoading((prev) => ({ ...prev, courses: true }));
        const coursesResponse = await fetch(
          "http://localhost:8080/api/admin/allcourses",
          { credentials: "include" }
        );
        const coursesData = await coursesResponse.json();
        if (coursesResponse.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (coursesResponse.ok) setCourses(coursesData.data);

        // Fetch teachers
        setLoading((prev) => ({ ...prev, teachers: true }));
        const teachersResponse = await fetch(
          "http://localhost:8080/api/admin/getallteachers",
          { credentials: "include" }
        );
        const teachersData = await teachersResponse.json();
        if (teachersResponse.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (teachersResponse.ok) setTeachers(teachersData.data || []);

        // Fetch schedules
        const schedulesResponse = await fetch(
          "http://localhost:8080/api/admin/getallschedule",
          { credentials: "include" }
        );
        const schedulesData = await schedulesResponse.json();
        if (schedulesResponse.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (schedulesResponse.ok) {
          const formattedEvents = schedulesData.data.map((schedule) => ({
            id: schedule.id,
            title: `${schedule.course?.name || "Untitled"} (${schedule.venue})`,
            start: schedule.startTime,
            end: schedule.endTime,
            extendedProps: {
              ...schedule,
            },
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading({ courses: false, teachers: false });
      }
    };

    fetchData();
  }, []);

  // Calendar date click handler
  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    setSelectedDate(dateStr);
    setFormData({
      scheduleId: "",
      courseId: "",
      date: dateStr,
      startTime: "09:00",
      endTime: "10:00",
      venue: "",
      duration: "",
      description: "",
      teacherId: "",
      recipientType: "student",
    });
    setShowFormModal(true);
  };

  // Calendar event click handler
  const handleEventClick = (info) => {
    const event = info.event;
    setFormData({
      scheduleId: event.id,
      courseId: event.extendedProps.courseId,
      date: event.startStr.split("T")[0],
      startTime: event.startStr.split("T")[1].substring(0, 5),
      endTime: event.endStr.split("T")[1].substring(0, 5),
      venue: event.extendedProps.venue,
      duration: event.extendedProps.duration?.toString() || "",
      description: event.extendedProps.description || "",
      teacherId: event.extendedProps.teacherId,
      recipientType: event.extendedProps.recipientType || "student",
    });
    setShowFormModal(true);
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      const url = formData.scheduleId
        ? "http://localhost:8080/api/admin/updateschedule"
        : "http://localhost:8080/api/admin/addschedule";

      const payload = {
        ...(formData.scheduleId && { id: formData.scheduleId }),
        courseId: formData.courseId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        duration: formData.duration,
        description: formData.description,
        teacherId: formData.teacherId,
        recipientType: formData.recipientType,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        resetForm();
        refreshCalendar();
      } else {
        throw new Error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error:", error);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/deleteschedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: formData.scheduleId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete schedule");
      }

      toast.success(data.message);
      resetForm();
      refreshCalendar();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      scheduleId: "",
      courseId: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      duration: "",
      description: "",
      teacherId: "",
      recipientType: "student",
    });
    setErrors({});
    setShowFormModal(false);
  };

  // Helper function to refresh calendar data
  const refreshCalendar = async () => {
    try {
      const schedulesResponse = await fetch(
        "http://localhost:8080/api/admin/getallschedule",
        { credentials: "include" }
      );
      const schedulesData = await schedulesResponse.json();
      if (schedulesResponse.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (schedulesResponse.ok) {
        const formattedEvents = schedulesData.data.map((schedule) => ({
          id: schedule.id,
          title: `${schedule.course?.name || "Untitled"} (${schedule.venue})`,
          start: schedule.startTime,
          end: schedule.endTime,
          extendedProps: {
            ...schedule,
          },
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error refreshing calendar:", error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Schedule Calendar
          </h2>
          <p className="text-gray-600 mb-6">
            Manage and view your teaching schedules
          </p>

          {/* Calendar Component */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              editable={true}
              selectable={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height={700}
              eventContent={(eventInfo) => (
                <div className="fc-event-content p-2">
                  <div className="font-semibold text-sm text-white">
                    {eventInfo.event.title.split(" (")[0]}
                  </div>
                  <div className="text-xs text-white opacity-90">
                    {eventInfo.timeText} • {eventInfo.event.extendedProps.venue}
                  </div>
                </div>
              )}
              eventClassNames="border-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
              dayHeaderClassNames="bg-gray-50 text-gray-700 font-medium"
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
              nowIndicatorClassNames="bg-red-500 h-1"
            />
          </div>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {formData.scheduleId ? "Edit Schedule" : "Create New Schedule"}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.courseId ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                      disabled={loading.courses}
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    {errors.courseId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.courseId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.teacherId ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                      disabled={loading.teachers}
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                    {errors.teacherId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.teacherId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.startTime ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Type
                    </label>
                    <select
                      name="recipientType"
                      value={formData.recipientType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="student">Students</option>
                      <option value="teacher">Teachers</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.venue ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.venue && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.venue}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.duration ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.endTime ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Submit and Delete Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                {formData.scheduleId && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {formData.scheduleId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendarWithForm;

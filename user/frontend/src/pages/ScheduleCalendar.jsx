import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const EventDisplayCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/getallschedule",
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
          const formattedEvents = data.data.map((schedule) => ({
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
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6  h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 ">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Event Calendar
          </h2>
          <p className="text-gray-600 mb-6">View your scheduled events</p>

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
              height={500}
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
              eventClassNames="border-none bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"
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
    </div>
  );
};

export default EventDisplayCalendar;

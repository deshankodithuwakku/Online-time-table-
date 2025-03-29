import ScheduleCalendar from "../pages/ScheduleCalendar";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold">150</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-semibold">Active Users</h3>
          <p className="text-3xl font-bold">120</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-semibold">New Registrations</h3>
          <p className="text-3xl font-bold">30</p>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="h-[500px]">
          <ScheduleCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from "react";
import Notifications from "../pages/Notifications.jsx";
import Sidebar from "../components/Sidebar"; // Import your sidebar component

export default function NotificationsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <Notifications />
          </div>
        </main>
      </div>
    </div>
  );
}

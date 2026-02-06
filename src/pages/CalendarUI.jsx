import React from "react";
import AdminLayout from "../components/layout/AdminLayout";
import useCalendarStore from "../stores/useCalendarStore";
import { useCalendarData } from "../hooks/useCalendarData";

import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarView from "../components/calendar/CalendarView";
import TaskModal from "../components/calendar/TaskModal";

const CalendarUI = ({ userRole, userName, displayName }) => {
  // Initialize data hook
  const { fetchData } = useCalendarData(userRole, userName, displayName);
  const { loading, error } = useCalendarStore();

  if (loading)
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg sm:text-xl font-semibold text-gray-700 animate-pulse text-center">
            Loading calendar data...
          </p>
        </div>
      </AdminLayout>
    );

  if (error)
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-4">
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border-2 border-red-100">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-6 text-xl sm:text-2xl font-bold text-center text-gray-900">
              {error}
            </h3>
            <button
              onClick={fetchData}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <CalendarHeader fetchData={fetchData} />
          <CalendarView />
        </div>
        <TaskModal />
      </div>
    </AdminLayout>
  );
};

export default CalendarUI;
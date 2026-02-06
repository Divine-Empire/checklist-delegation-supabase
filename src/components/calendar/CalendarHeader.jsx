import React from 'react';
import useCalendarStore from '../../stores/useCalendarStore';
import { formatDate } from '../../utils/calendarUtils';

const CalendarHeader = ({ fetchData }) => {
    const {
        loading,
        lastWorkingDate,
        selectedNameFilter,
        setSelectedNameFilter,
        availableNames
    } = useCalendarStore();

    // Helper for date display
    const formatDateDisplay = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 border border-gray-100">
            <div className="flex flex-col gap-2 sm:gap-3">
                {/* Header Section */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Task Calendar
                        </h1>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-center">
                        <select
                            value={selectedNameFilter}
                            onChange={(e) => setSelectedNameFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                        >
                            <option value="all">All Names</option>
                            {availableNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>

                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Date Range Info */}
                {lastWorkingDate && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">
                                Today → {formatDateDisplay(lastWorkingDate)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarHeader;

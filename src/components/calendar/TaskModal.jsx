import React, { useState } from 'react';
import useCalendarStore from '../../stores/useCalendarStore';
import { normalize, freqMapKey, freqLabels, freqColors, formatDate } from '../../utils/calendarUtils';

const TaskModal = () => {
    const {
        selectedEvent,
        showModal,
        setShowModal,
        modalTab,
        setModalTab, // Using store for tab state
        dateDataMap,
        lastWorkingDate
    } = useCalendarStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("name");
    const [statusFilter, setStatusFilter] = useState("all");

    if (!showModal || !selectedEvent || !selectedEvent.isDateView) return null;

    // Get tasks based on selected tab
    const getTasksForTab = () => {
        if (modalTab === "day") {
            return selectedEvent.dataObj.tasks || [];
        } else if (modalTab === "week") {
            const dateObj = selectedEvent.dateObj;
            if (!dateObj) return [];
            const weekTasks = [];

            const dayOfWeek = dateObj.getDay();
            const startOfWeek = new Date(dateObj);
            startOfWeek.setDate(dateObj.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            Object.keys(dateDataMap).forEach((dateStr) => {
                const d = new Date(dateStr);
                if (d >= startOfWeek && d <= endOfWeek) {
                    const dayTasks = dateDataMap[dateStr]?.tasks || [];
                    dayTasks.forEach((task) => {
                        if (!weekTasks.some((t) => t.taskId === task.taskId)) {
                            weekTasks.push(task);
                        }
                    });
                }
            });

            return weekTasks;
        } else if (modalTab === "month") {
            const dateObj = selectedEvent.dateObj;
            if (!dateObj) return [];
            const monthTasks = [];

            const month = dateObj.getMonth();
            const year = dateObj.getFullYear();

            Object.keys(dateDataMap).forEach((dateStr) => {
                const d = new Date(dateStr);
                if (d.getMonth() === month && d.getFullYear() === year) {
                    const dayTasks = dateDataMap[dateStr]?.tasks || [];
                    dayTasks.forEach((task) => {
                        if (!monthTasks.some((t) => t.taskId === task.taskId)) {
                            monthTasks.push(task);
                        }
                    });
                }
            });

            return monthTasks;
        }
        return selectedEvent.dataObj.tasks || [];
    };

    const tasksToShow = getTasksForTab();

    // Filter tasks based on status and search
    const getFilteredTasks = () => {
        let filtered = tasksToShow;

        // Apply status filter
        if (statusFilter === "pending") {
            filtered = filtered.filter((t) => normalize(t.status || "") !== "done");
        } else if (statusFilter === "completed") {
            filtered = filtered.filter((t) => normalize(t.status || "") === "done");
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((task) => {
                if (filterType === "name") {
                    return String(task.name || "").toLowerCase().includes(query);
                } else {
                    return String(task.taskId || "").toLowerCase().includes(query);
                }
            });
        }

        return filtered;
    };

    const filteredTasks = getFilteredTasks();
    const hasTasks = filteredTasks.length > 0;

    // Group tasks by frequency
    const groupedTasks = filteredTasks.reduce((groups, task) => {
        const freq = freqMapKey(task.freq);
        if (!groups[freq]) {
            groups[freq] = [];
        }
        groups[freq].push(task);
        return groups;
    }, {});

    // Format date for display
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate pr-2">
                            📅 Tasks - {selectedEvent.date}
                            {lastWorkingDate && (
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                    (Range: Today - {formatDateDisplay(lastWorkingDate)})
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${statusFilter === "all" ? "bg-gray-800 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                            All Tasks
                        </button>
                        {/* Status filters were commented out in original, keeping consistent */}
                    </div>

                    {/* Search Filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="name">By Name</option>
                            <option value="taskId">By Task ID</option>
                        </select>
                        <input
                            type="text"
                            placeholder={`Search by ${filterType === "name" ? "person name" : "task ID"}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-xs sm:text-sm font-medium text-gray-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 bg-gray-50">
                    {!hasTasks && (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mb-4">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-base sm:text-lg font-medium">
                                No tasks found for selected filters
                            </p>
                        </div>
                    )}

                    {Object.keys(groupedTasks).map((frequency) => {
                        const tasks = groupedTasks[frequency];
                        if (tasks.length === 0) return null;

                        return (
                            <div key={frequency} className="mb-4 sm:mb-6">
                                <div
                                    className="flex items-center gap-2 mb-3 pb-2 border-b-2"
                                    style={{ borderColor: freqColors[frequency] }}
                                >
                                    <div
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: freqColors[frequency] }}
                                    />
                                    <h4 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                                        {freqLabels[frequency]} ({tasks.length})
                                    </h4>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {tasks.map((t, i) => (
                                        <div
                                            key={`${frequency}-${t.taskId}-${i}`}
                                            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow"
                                            style={{ borderColor: freqColors[frequency] }}
                                        >
                                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words">
                                                        {t.description || t.name || "Task"}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                                                            ID: {t.taskId}
                                                        </span>
                                                        {t.time && (
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                                                                🕐 {t.time}
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 rounded-md font-medium ${t.status === "done" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                            {t.status === "done" ? "✓ Completed" : "🔄 Pending"}
                                                        </span>
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium truncate">
                                                            👤 {t.name || "N/A"}
                                                        </span>
                                                        {t.priority && t.priority !== "normal" && (
                                                            <span
                                                                className="px-2 py-1 rounded-md font-semibold text-white"
                                                                style={{
                                                                    backgroundColor:
                                                                        t.priority === "high"
                                                                            ? "#ef4444"
                                                                            : t.priority === "medium"
                                                                                ? "#f59e0b"
                                                                                : "#10b981",
                                                                }}
                                                            >
                                                                {t.priority.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 text-xs">
                                                        <span className="text-gray-500">
                                                            Frequency:{" "}
                                                            <span className="font-semibold">
                                                                {t.freq || "One-Time"}
                                                            </span>{" "}
                                                            • Next Occurrence:{" "}
                                                            <span className="font-semibold">
                                                                {formatDate(t.occurrenceDate || t.startDate)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {t.remarks && (
                                                        <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 px-2 py-1 rounded-md inline-block">
                                                            💬 {t.remarks}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 bg-white border-t border-gray-200">
                    <button
                        onClick={() => setShowModal(false)}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AdminLayout from "../components/layout/AdminLayout";
import supabase from "../SupabaseClient";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForDate, setTasksForDate] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const calendarRef = useRef(null);

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user role and name from localStorage
      const userRole = localStorage.getItem("role") || "user";
      const userName = localStorage.getItem("user-name") || "";

      // Fetch checklist tasks
      let checklistQuery = supabase
        .from('checklist')
        .select('*');

      if (userRole === 'user' && userName) {
        checklistQuery = checklistQuery.eq('name', userName);
      }

      const { data: checklistData, error: checklistError } = await checklistQuery;

      if (checklistError) {
        console.error("Error fetching checklist data:", checklistError);
        throw checklistError;
      }

      // Fetch delegation tasks
      let delegationQuery = supabase
        .from('delegation')
        .select('*');

      if (userRole === 'user' && userName) {
        delegationQuery = delegationQuery.eq('name', userName);
      }

      const { data: delegationData, error: delegationError } = await delegationQuery;

      if (delegationError) {
        console.error("Error fetching delegation data:", delegationError);
        throw delegationError;
      }

      // Combine tasks from both tables
      const allTasks = [...checklistData, ...delegationData];

      // Transform tasks to calendar events
      const calendarEvents = allTasks.map((task, index) => {
        let startDate = task.task_start_date || task.created_at;
        let endDate = task.planned_date || task.task_end_date;

        // Ensure dates are in proper format
        if (startDate) {
          startDate = new Date(startDate).toISOString().split('T')[0];
        }
        if (endDate) {
          endDate = new Date(endDate).toISOString().split('T')[0];
        }

        return {
          id: `${task.task_id || task.id}-${index}`,
          title: task.task_description || task.task_name || "Task",
          start: startDate,
          end: endDate,
          extendedProps: {
            task: task,
            type: task.table_type || (task.task_id ? 'checklist' : 'delegation'),
            status: task.status || 'pending',
            department: task.department || 'N/A',
            assignedTo: task.name || 'N/A',
            givenBy: task.given_by || 'N/A',
          },
          backgroundColor: task.status === 'done' ? '#10b981' : '#3b82f6', // Green for done, Blue for pending
          borderColor: task.status === 'done' ? '#059669' : '#2563eb',
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle date click
  const handleDateClick = (arg) => {
    const clickedDate = arg.date;
    const formattedDate = clickedDate.toISOString().split('T')[0];
    
    // Filter tasks for the clicked date
    const dateTasks = events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === formattedDate;
    });

    setSelectedDate(clickedDate);
    setTasksForDate(dateTasks);
    setShowTaskModal(true);
  };

  // Handle event click
  const handleEventClick = (arg) => {
    setSelectedDate(new Date(arg.event.start));
    setTasksForDate([arg.event]);
    setShowTaskModal(true);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading calendar...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Calendar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Calendar</h1>
            <p className="text-gray-600">View and manage your tasks on the calendar</p>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              height="auto"
            />
          </div>
        </div>

        {/* Task Detail Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Tasks for {formatDate(selectedDate)}
                  </h2>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {tasksForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-600">No tasks scheduled for this date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasksForDate.map((event, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.extendedProps.status === 'done' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.extendedProps.status || 'pending'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Department:</span> {event.extendedProps.department}
                          </div>
                          <div>
                            <span className="font-medium">Assigned To:</span> {event.extendedProps.assignedTo}
                          </div>
                          <div>
                            <span className="font-medium">Given By:</span> {event.extendedProps.givenBy}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {event.extendedProps.type}
                          </div>
                        </div>
                        
                        {event.extendedProps.task.task_description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Description:</span> {event.extendedProps.task.task_description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Calendar;
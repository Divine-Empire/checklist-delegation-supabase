import React, { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import useCalendarStore from "../../stores/useCalendarStore";
import { formatDate, toDate, freqColors } from "../../utils/calendarUtils";

const CalendarView = () => {
    const calendarRef = useRef(null);
    const {
        events,
        calendarKey,
        lastWorkingDate,
        dateDataMap,
        setSelectedEvent,
        setShowModal,
        setModalTab
    } = useCalendarStore();

    const handleEventClick = (info) => {
        const props = info.event.extendedProps;
        const dateStr = props.dateStr || info.event.startStr.split("T")[0];
        const timeKey = props.timeKey || "no-time";

        setSelectedEvent({
            isDateView: true,
            date: formatDate(dateStr),
            dateObj: toDate(dateStr),
            timeKey: timeKey,
            dataObj: dateDataMap[dateStr] || { tasks: [] },
            tasksAtTime: props.tasks || [],
        });
        setModalTab("day");
        setShowModal(true);
    };

    const handleDateClick = (info) => {
        const dateStr = info.dateStr;
        const dateObj = toDate(info.dateStr);
        setSelectedEvent({
            isDateView: true,
            date: formatDate(info.dateStr),
            dateObj: dateObj,
            timeKey: "all",
            dataObj: dateDataMap[dateStr] || { tasks: [] },
            tasksAtTime: [],
        });
        setModalTab("day");
        setShowModal(true);
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-2 sm:p-8 border border-indigo-100">
            <style>{`
        .fc-event { background-color: transparent !important; border: none !important; }
        .fc-daygrid-event { background-color: transparent !important; border: none !important; }
        .fc-h-event { background-color: transparent !important; border: none !important; }
        .fc-timegrid-event { background-color: transparent !important; border: none !important; }
        .fc .fc-toolbar { flex-direction: column; gap: 0.5rem; }
        @media (min-width: 640px) { .fc .fc-toolbar { flex-direction: row; } }
        .fc .fc-toolbar-chunk { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.25rem; }
        .fc .fc-button { padding: 0.375rem 0.75rem !important; font-size: 0.875rem !important; }
        @media (min-width: 640px) { .fc .fc-button { padding: 0.5rem 1rem !important; font-size: 1rem !important; } }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #e5e7eb; }
      `}</style>
            <FullCalendar
                key={calendarKey}
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                slotDuration="01:00:00"
                slotLabelInterval="01:00"
                slotLabelFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: false,
                }}
                events={events}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                eventDisplay="block"
                displayEventTime={true}
                eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: false,
                }}
                eventBackgroundColor="transparent"
                eventBorderColor="transparent"
                eventClassNames="cursor-pointer transition-all duration-200 hover:opacity-80"
                dayCellClassNames="hover:bg-green-100"
                allDaySlot={true}
                nowIndicator={true}
                validRange={
                    lastWorkingDate
                        ? {
                            start: new Date(new Date().setDate(new Date().getDate() + 1)), // Logic from original: tomorrow?
                            // Original: new Date().setDate(new Date().getDate() + 1)
                            // Wait, original: start: new Date(new Date().setDate(new Date().getDate() + 1))
                            // This implies start date is tomorrow. Users can't see today?
                            // Actually, let's keep original logic. 
                            end: lastWorkingDate,
                        }
                        : {}
                }
                eventContent={(arg) => {
                    const props = arg.event.extendedProps;
                    const taskCount = props?.taskCount || 0;

                    if (taskCount === 0) return null;

                    return (
                        <div className="flex items-center justify-center gap-1 p-0.5 sm:p-1 h-full w-full">
                            <div
                                className="text-xs sm:text-sm font-bold text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm"
                                style={{ backgroundColor: freqColors.oneTime }}
                            >
                                {taskCount} Tasks
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default CalendarView;

import React, { useState } from "react";

const CalendarComponent = ({ date, onChange, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day) => {
        const selectedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        onChange(selectedDate);
        onClose();
    };

    const renderDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(
            currentMonth.getFullYear(),
            currentMonth.getMonth()
        );
        const firstDayOfMonth = getFirstDayOfMonth(
            currentMonth.getFullYear(),
            currentMonth.getMonth()
        );

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected =
                date &&
                date.getDate() === day &&
                date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${isSelected
                        ? "bg-purple-600 text-white"
                        : "hover:bg-purple-100 text-gray-700"
                        }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    return (
        <div className="p-2 bg-white border border-gray-200 rounded-md shadow-md">
            <div className="flex justify-between items-center mb-2">
                <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    &lt;
                </button>
                <div className="text-sm font-medium">
                    {currentMonth.toLocaleString("default", { month: "long" })}{" "}
                    {currentMonth.getFullYear()}
                </div>
                <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    &gt;
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                        key={day}
                        className="h-8 w-8 flex items-center justify-center text-xs text-gray-500"
                    >
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
        </div>
    );
};

export default CalendarComponent;

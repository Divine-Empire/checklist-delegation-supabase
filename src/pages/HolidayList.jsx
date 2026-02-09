import React, { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { Pencil, Trash2, Download } from "lucide-react";
import supabase from "../SupabaseClient";

const HolidayList = () => {
    const [holidays, setHolidays] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({ day: "", date: "", name: "" });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    // Working Days State
    const [workingDays, setWorkingDays] = useState([]);
    const [workingDayModalOpen, setWorkingDayModalOpen] = useState(false);
    const [workingDayEditIndex, setWorkingDayEditIndex] = useState(null);
    const [workingDayFormData, setWorkingDayFormData] = useState({ working_date: "", day: "" });
    const [workingDayLoading, setWorkingDayLoading] = useState(false);
    const [showWorkingDays, setShowWorkingDays] = useState(false);

    // Filter State
    const [holidayMonthFilter, setHolidayMonthFilter] = useState("All");
    const [holidayYearFilter, setHolidayYearFilter] = useState("All");
    const [workingMonthFilter, setWorkingMonthFilter] = useState("All");
    const [workingYearFilter, setWorkingYearFilter] = useState("All");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Fetch holidays and working days from Supabase on component mount
    useEffect(() => {
        fetchHolidaysFromSupabase();
        fetchWorkingDaysFromSupabase();
    }, []);

    const fetchHolidaysFromSupabase = async () => {
        setFetchLoading(true);
        try {
            const { data, error } = await supabase
                .from('holidays')
                .select('*')
                .order('holiday_date', { ascending: true });

            if (error) {
                console.error("Error fetching holidays from Supabase:", error);
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    alert("Holidays table does not exist in the database. Please create the table first.");
                } else {
                    alert("Failed to fetch holidays from database: " + error.message);
                }
                return;
            }

            const formattedHolidays = data.map(holiday => ({
                id: holiday.id,
                day: holiday.day || "",
                date: formatDateToDisplay(holiday.holiday_date),
                name: holiday.holiday_name || "",
                created_at: holiday.created_at
            }));

            setHolidays(formattedHolidays);
        } catch (error) {
            console.error("Error fetching holidays:", error);
            alert("Error fetching holidays: " + error.message);
        } finally {
            setFetchLoading(false);
        }
    };

    const formatDateToDisplay = (dateString) => {
        if (!dateString) return "";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev };

            if (name === 'date') {
                updatedForm.date = value;

                if (value) {
                    const date = new Date(value);
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayName = dayNames[date.getDay()];
                    updatedForm.day = dayName;
                }
            } else {
                updatedForm[name] = value;
            }

            return updatedForm;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.day || !formData.date || !formData.name) {
            alert("Please fill all fields!");
            return;
        }

        setLoading(true);

        try {
            const rawDateValue = formData.date;

            if (editIndex !== null) {
                const holidayToUpdate = holidays[editIndex];

                const { error } = await supabase
                    .from('holidays')
                    .update({
                        day: formData.day,
                        holiday_date: rawDateValue,
                        holiday_name: formData.name
                    })
                    .eq('id', holidayToUpdate.id);

                if (error) {
                    throw error;
                }

                const updatedHolidays = [...holidays];
                updatedHolidays[editIndex] = {
                    ...updatedHolidays[editIndex],
                    day: formData.day,
                    date: formatDateToDisplay(rawDateValue),
                    name: formData.name
                };
                setHolidays(updatedHolidays);

                alert("Holiday updated successfully!");
            } else {
                const { data, error } = await supabase
                    .from('holidays')
                    .insert([{
                        day: formData.day,
                        holiday_date: rawDateValue,
                        holiday_name: formData.name
                    }])
                    .select();

                if (error) {
                    if (error.code === '42P01' || error.message.includes('does not exist')) {
                        throw new Error("Holidays table does not exist in the database. Please create the table first.");
                    } else {
                        throw error;
                    }
                }

                const newHoliday = {
                    id: data[0].id,
                    day: formData.day,
                    date: formatDateToDisplay(rawDateValue),
                    name: formData.name,
                    created_at: data[0].created_at
                };

                setHolidays([...holidays, newHoliday]);
                alert("Holiday added successfully!");
            }

            setFormData({ day: "", date: "", name: "" });
            setEditIndex(null);
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving holiday:", error);
            alert(`Failed to save holiday: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index) => {
        const holiday = holidays[index];
        const [day, month, year] = holiday.date.split("-");
        const formattedDateForInput = `${year}-${month}-${day}`;

        setEditIndex(index);
        setFormData({
            day: holiday.day,
            date: formattedDateForInput,
            name: holiday.name,
        });
        setModalOpen(true);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) {
            return;
        }

        setLoading(true);
        const holidayToDelete = holidays[index];

        try {
            const { error } = await supabase
                .from('holidays')
                .delete()
                .eq('id', holidayToDelete.id);

            if (error) {
                throw error;
            }

            const updatedHolidays = holidays.filter((_, i) => i !== index);
            setHolidays(updatedHolidays);

            alert("Holiday deleted successfully!");
        } catch (error) {
            console.error("Error deleting holiday:", error);
            alert(`Failed to delete holiday: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const header = ["Date", "Day", "Holiday Name"];
        const rows = holidays.map((h) => [h.date, h.day, h.name]);

        const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "Holidays.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const refreshFromSupabase = async () => {
        await fetchHolidaysFromSupabase();
        alert("Holidays refreshed from database!");
    };

    // ==================== WORKING DAYS FUNCTIONS ====================

    const fetchWorkingDaysFromSupabase = async () => {
        setFetchLoading(true);
        try {
            const { data, error } = await supabase
                .from('working_day_calender')
                .select('*')
                .order('working_date', { ascending: true });

            if (error) {
                console.error("Error fetching working days from Supabase:", error);
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    console.log("Working days table does not exist yet.");
                }
                return;
            }

            const formattedWorkingDays = data.map(wd => ({
                id: wd.id,
                working_date: formatDateToDisplay(wd.working_date),
                day: wd.day || "",
                created_at: wd.created_at
            }));

            setWorkingDays(formattedWorkingDays);
        } catch (error) {
            console.error("Error fetching working days:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleWorkingDayChange = (e) => {
        const { name, value } = e.target;
        setWorkingDayFormData(prev => {
            const updatedForm = { ...prev };

            if (name === 'working_date') {
                updatedForm.working_date = value;

                if (value) {
                    const date = new Date(value);
                    const dayNamesHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
                    const dayName = dayNamesHindi[date.getDay()];
                    updatedForm.day = dayName;
                }
            } else {
                updatedForm[name] = value;
            }

            return updatedForm;
        });
    };

    const handleWorkingDaySubmit = async (e) => {
        e.preventDefault();
        if (!workingDayFormData.working_date || !workingDayFormData.day) {
            alert("Please fill all fields!");
            return;
        }

        setWorkingDayLoading(true);

        try {
            const rawDateValue = workingDayFormData.working_date;

            if (workingDayEditIndex !== null) {
                const workingDayToUpdate = workingDays[workingDayEditIndex];

                const { error } = await supabase
                    .from('working_day_calender')
                    .update({
                        working_date: rawDateValue,
                        day: workingDayFormData.day
                    })
                    .eq('id', workingDayToUpdate.id);

                if (error) throw error;

                const updatedWorkingDays = [...workingDays];
                updatedWorkingDays[workingDayEditIndex] = {
                    ...updatedWorkingDays[workingDayEditIndex],
                    working_date: formatDateToDisplay(rawDateValue),
                    day: workingDayFormData.day
                };
                setWorkingDays(updatedWorkingDays);

                alert("Working day updated successfully!");
            } else {
                const { data, error } = await supabase
                    .from('working_day_calender')
                    .insert([{
                        working_date: rawDateValue,
                        day: workingDayFormData.day
                    }])
                    .select();

                if (error) {
                    if (error.code === '42P01' || error.message.includes('does not exist')) {
                        throw new Error("Working days table does not exist. Please create the table first.");
                    }
                    throw error;
                }

                const newWorkingDay = {
                    id: data[0].id,
                    working_date: formatDateToDisplay(rawDateValue),
                    day: workingDayFormData.day,
                    created_at: data[0].created_at
                };

                setWorkingDays([...workingDays, newWorkingDay]);
                alert("Working day added successfully!");
            }

            setWorkingDayFormData({ working_date: "", day: "" });
            setWorkingDayEditIndex(null);
            setWorkingDayModalOpen(false);
        } catch (error) {
            console.error("Error saving working day:", error);
            alert(`Failed to save working day: ${error.message}`);
        } finally {
            setWorkingDayLoading(false);
        }
    };

    const handleWorkingDayEdit = (index) => {
        const workingDay = workingDays[index];
        const [day, month, year] = workingDay.working_date.split("-");
        const formattedDateForInput = `${year}-${month}-${day}`;

        setWorkingDayEditIndex(index);
        setWorkingDayFormData({
            working_date: formattedDateForInput,
            day: workingDay.day
        });
        setWorkingDayModalOpen(true);
    };

    const handleWorkingDayDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this working day?")) {
            return;
        }

        setWorkingDayLoading(true);
        const workingDayToDelete = workingDays[index];

        try {
            const { error } = await supabase
                .from('working_day_calender')
                .delete()
                .eq('id', workingDayToDelete.id);

            if (error) throw error;

            const updatedWorkingDays = workingDays.filter((_, i) => i !== index);
            setWorkingDays(updatedWorkingDays);

            alert("Working day deleted successfully!");
        } catch (error) {
            console.error("Error deleting working day:", error);
            alert(`Failed to delete working day: ${error.message}`);
        } finally {
            setWorkingDayLoading(false);
        }
    };

    const handleAddHoliday = () => {
        if (showWorkingDays) {
            setShowWorkingDays(false);
        } else {
            // Clear any previous edit state
            setFormData({ day: "", date: "", name: "" });
            setEditIndex(null);
            setModalOpen(true);
        }
    };

    const handleWorkingDaysToggle = () => {
        setShowWorkingDays(!showWorkingDays);
    };

    const handleAddWorkingDay = () => {
        // Clear any previous edit state
        setWorkingDayFormData({ working_date: "", day: "" });
        setWorkingDayEditIndex(null);
        setWorkingDayModalOpen(true);
    };

    // Filter Logic
    const getFilteredHolidays = () => {
        return holidays.filter(h => {
            const [d, m, y] = h.date.split("-");
            const monthMatch = holidayMonthFilter === "All" || months[parseInt(m) - 1] === holidayMonthFilter;
            const yearMatch = holidayYearFilter === "All" || y === holidayYearFilter;
            return monthMatch && yearMatch;
        });
    };

    const getFilteredWorkingDays = () => {
        return workingDays.filter(wd => {
            const [d, m, y] = wd.working_date.split("-");
            const monthMatch = workingMonthFilter === "All" || months[parseInt(m) - 1] === workingMonthFilter;
            const yearMatch = workingYearFilter === "All" || y === workingYearFilter;
            return monthMatch && yearMatch;
        });
    };

    const getAvailableYears = (data, dateKey) => {
        const years = new Set();
        data.forEach(item => {
            const date = item[dateKey];
            if (date) {
                const year = date.split("-")[2];
                if (year) years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    };

    const filteredHolidays = getFilteredHolidays();
    const filteredWorkingDays = getFilteredWorkingDays();
    const holidayYears = getAvailableYears(holidays, "date");
    const workingYears = getAvailableYears(workingDays, "working_date");

    return (
        <AdminLayout>
            <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-purple-700">
                            🎉 Holiday List
                        </h1>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAddHoliday}
                                disabled={loading}
                                className="rounded-md gradient-bg py-2 px-3 sm:px-4 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
                            >
                                {showWorkingDays ? 'Show Holiday List' : '+ Add Holiday'}
                            </button>
                            <button
                                onClick={handleWorkingDaysToggle}
                                disabled={workingDayLoading}
                                className={`rounded-md py-2 px-3 sm:px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base ${showWorkingDays ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                + Working Days
                            </button>
                        </div>
                    </div>
                </div>

                {!showWorkingDays && (
                    <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-purple-700 font-medium text-sm sm:text-base">
                                Holiday Records
                            </h2>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <select
                                    value={holidayMonthFilter}
                                    onChange={(e) => setHolidayMonthFilter(e.target.value)}
                                    className="px-2 py-1 text-xs border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                                >
                                    <option value="All">All Months</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select
                                    value={holidayYearFilter}
                                    onChange={(e) => setHolidayYearFilter(e.target.value)}
                                    className="px-2 py-1 text-xs border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                                >
                                    <option value="All">All Years</option>
                                    {holidayYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        {fetchLoading ? (
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                                <p className="text-purple-600 text-sm sm:text-base">Loading holidays...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                #
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                Day
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                Date
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] bg-gray-50">
                                                Holiday Name
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredHolidays.length > 0 ? (
                                            filteredHolidays.map((h, i) => (
                                                <tr key={h.id || i} className="hover:bg-gray-50">
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                            {i + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="text-xs sm:text-sm text-gray-900">
                                                            {h.day}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="text-xs sm:text-sm text-gray-900">
                                                            {h.date}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4 min-w-[200px]">
                                                        <div className="text-xs sm:text-sm text-gray-900 break-words" title={h.name}>
                                                            {h.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="flex gap-2">
                                                            <Pencil
                                                                size={16}
                                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                                onClick={() => handleEdit(i)}
                                                                title="Edit"
                                                            />
                                                            <Trash2
                                                                size={16}
                                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                                                onClick={() => handleDelete(i)}
                                                                title="Delete"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 sm:px-6 py-4 text-center text-gray-500 text-xs sm:text-sm">
                                                    No holidays found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {modalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-black/20"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="relative z-50 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {editIndex !== null ? "Edit Holiday" : "Add Holiday"}
                                            </h3>
                                            <form onSubmit={handleSubmit}>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Day
                                                        </label>
                                                        <select
                                                            id="day"
                                                            name="day"
                                                            value={formData.day}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        >
                                                            <option value="">Select Day</option>
                                                            <option value="Monday">Monday</option>
                                                            <option value="Tuesday">Tuesday</option>
                                                            <option value="Wednesday">Wednesday</option>
                                                            <option value="Thursday">Thursday</option>
                                                            <option value="Friday">Friday</option>
                                                            <option value="Saturday">Saturday</option>
                                                            <option value="Sunday">Sunday</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="date"
                                                            name="date"
                                                            value={formData.date}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Holiday Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            placeholder="e.g., New Year, Christmas, Diwali"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                                    >
                                                        {loading
                                                            ? "Saving..."
                                                            : editIndex !== null
                                                                ? "Update"
                                                                : "Save"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ day: "", date: "", name: "" });
                                                            setEditIndex(null);
                                                            setModalOpen(false);
                                                        }}
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showWorkingDays && (
                    <>
                        <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden mt-6">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-purple-700 font-medium text-sm sm:text-base">
                                    📅 Working Days Records
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <select
                                        value={workingMonthFilter}
                                        onChange={(e) => setWorkingMonthFilter(e.target.value)}
                                        className="px-2 py-1 text-xs border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                                    >
                                        <option value="All">All Months</option>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select
                                        value={workingYearFilter}
                                        onChange={(e) => setWorkingYearFilter(e.target.value)}
                                        className="px-2 py-1 text-xs border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                                    >
                                        <option value="All">All Years</option>
                                        {workingYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <button
                                        onClick={handleAddWorkingDay}
                                        className="rounded-md bg-purple-600 py-1.5 px-3 text-white hover:bg-purple-700 text-xs sm:text-sm"
                                    >
                                        + Add Working Day
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                #
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                Working Date
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                Day
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredWorkingDays.length > 0 ? (
                                            filteredWorkingDays.map((wd, i) => (
                                                <tr key={wd.id || i} className="hover:bg-gray-50">
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                            {i + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="text-xs sm:text-sm text-gray-900">
                                                            {wd.working_date}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="text-xs sm:text-sm text-gray-900">
                                                            {wd.day}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                        <div className="flex gap-2">
                                                            <Pencil
                                                                size={16}
                                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                                onClick={() => handleWorkingDayEdit(i)}
                                                                title="Edit"
                                                            />
                                                            {/* <Trash2
                                                                size={16}
                                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                                                onClick={() => handleWorkingDayDelete(i)}
                                                                title="Delete"
                                                            /> */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 sm:px-6 py-4 text-center text-gray-500 text-xs sm:text-sm">
                                                    No working days found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {workingDayModalOpen && (
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                        <div className="absolute inset-0 bg-black/20"></div>
                                    </div>

                                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                    <div className="relative z-50 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                            <div className="sm:flex sm:items-start">
                                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                        {workingDayEditIndex !== null ? "Edit Working Day" : "Add Working Day"}
                                                    </h3>
                                                    <form onSubmit={handleWorkingDaySubmit}>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <label htmlFor="working_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Working Date
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    id="working_date"
                                                                    name="working_date"
                                                                    value={workingDayFormData.working_date}
                                                                    onChange={handleWorkingDayChange}
                                                                    required
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Day (Hindi)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    id="day"
                                                                    name="day"
                                                                    placeholder="e.g., शुक्रवार, शनिवार"
                                                                    value={workingDayFormData.day}
                                                                    onChange={handleWorkingDayChange}
                                                                    required
                                                                    readOnly
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-50"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                                                            <button
                                                                type="submit"
                                                                disabled={workingDayLoading}
                                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                                            >
                                                                {workingDayLoading
                                                                    ? "Saving..."
                                                                    : workingDayEditIndex !== null
                                                                        ? "Update"
                                                                        : "Save"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setWorkingDayFormData({ working_date: "", day: "" });
                                                                    setWorkingDayEditIndex(null);
                                                                    setWorkingDayModalOpen(false);
                                                                }}
                                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default HolidayList;
import { useEffect } from 'react';
import supabase from '../SupabaseClient';
import useHolidayStore from '../stores/useHolidayStore';


// Helper if not yet in dateUtils, but I'll assume I should check or duplicate for now safely.
// Actually, I saw `formatDateToDisplay` in the original file. 
// I will reuse `src/utils/dateUtils.js` if it has it, or add it there.
// Checking previous view of `src/utils/dateUtils.js`: existing functions are `formatDate`, `formatDateToDDMMYYYY`.
// The original `formatDateToDisplay` is DD-MM-YYYY. `formatDateToDDMMYYYY` seems to match. 
// Let's check `src/utils/dateUtils.js` content first to be sure.

export const useHolidayManager = () => {
    const {
        holidays,
        formData,
        editIndex,
        setHolidays,
        setFormData,
        setEditIndex,
        setModalOpen,
        setLoading,
        setFetchLoading,
        resetFormData
    } = useHolidayStore();

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


    const fetchHolidays = async () => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'date') {
            // date input gives YYYY-MM-DD
            // We update formData with this raw value.
            let updatedData = { date: value };

            if (value) {
                const date = new Date(value);
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                updatedData.day = dayNames[date.getDay()];
            }
            setFormData(updatedData);
        } else {
            setFormData({ [name]: value });
        }
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

                if (error) throw error;

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
                        throw new Error("Holidays table does not exist in the database.");
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

            resetFormData();
            setEditIndex(null);
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving holiday:", error);
            alert(`Failed to save holiday: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;

        setLoading(true);
        const holidayToDelete = holidays[index];

        try {
            const { error } = await supabase
                .from('holidays')
                .delete()
                .eq('id', holidayToDelete.id);

            if (error) throw error;

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

    // Initial fetch
    useEffect(() => {
        fetchHolidays();
    }, []);

    return {
        fetchHolidays,
        handleChange,
        handleSubmit,
        handleDelete,
        handleEdit,
        exportToCSV
    };
};

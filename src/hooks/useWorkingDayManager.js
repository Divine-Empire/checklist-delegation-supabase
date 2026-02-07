import { useEffect } from 'react';
import supabase from '../SupabaseClient';
import useHolidayStore from '../stores/useHolidayStore';

export const useWorkingDayManager = () => {
    const {
        workingDays,
        workingDayFormData,
        workingDayEditIndex,
        setWorkingDays,
        setWorkingDayFormData,
        setWorkingDayEditIndex,
        setWorkingDayModalOpen,
        setWorkingDayLoading,
        setFetchLoading,
        resetWorkingDayFormData
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

    const fetchWorkingDays = async () => {
        setFetchLoading(true);
        try {
            const { data, error } = await supabase
                .from('working_day_calender') // Correct table name as per original code
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

        let updatedData = { ...workingDayFormData };

        if (name === 'working_date') {
            updatedData.working_date = value;
            if (value) {
                const date = new Date(value);
                const dayNamesHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
                updatedData.day = dayNamesHindi[date.getDay()];
            }
        } else {
            updatedData[name] = value;
        }
        setWorkingDayFormData(updatedData);
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
                // Update
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
                // Insert
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

            resetWorkingDayFormData();
            setWorkingDayEditIndex(null);
            setWorkingDayModalOpen(false);
        } catch (error) {
            console.error("Error saving working day:", error);
            alert(`Failed to save working day: ${error.message}`);
        } finally {
            setWorkingDayLoading(false);
        }
    };

    const handleWorkingDayDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this working day?")) return;

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

    const handleOpenWorkingDayAddModal = () => {
        console.log("Opening Add Working Day Modal");
        setWorkingDayEditIndex(null);
        resetWorkingDayFormData();
        setWorkingDayModalOpen(true);
    };

    return {
        fetchWorkingDays,
        handleWorkingDayChange,
        handleWorkingDaySubmit,
        handleWorkingDayDelete,
        handleWorkingDayEdit,
        handleOpenWorkingDayAddModal
    };
};

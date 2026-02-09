import { useEffect } from "react";
import { useDispatch } from "react-redux";
import supabase from "../SupabaseClient";
import useAssignTaskStore from "../stores/useAssignTaskStore";
import {
    formatDateToDDMMYYYY,
    findNextWorkingDay,
    findEndOfWeekDate,
    addDays,
    addMonths,
    addYears,
    formatDateTimeForStorage
} from "../utils/dateUtils";
import { assignTaskInTable } from "../redux/slice/assignTaskSlice";

export const useAssignTask = () => {
    const dispatch = useDispatch();
    const {
        formData,
        date,
        time,
        generatedTasks,
        workingDays,
        setFormData,
        setGeneratedTasks,
        setAccordionOpen,
        setIsSubmitting,
        setWorkingDays,
        resetForm
    } = useAssignTaskStore();

    // Fetch working days from Supabase on component mount
    useEffect(() => {
        const fetchWorkingDays = async () => {
            try {
                const { data, error } = await supabase
                    .from("working_day_calender")
                    .select("working_date, day")
                    .order("working_date", { ascending: true });

                if (error) throw error;

                const formattedDays = data.map((day) => {
                    const date = new Date(day.working_date);
                    return formatDateToDDMMYYYY(date);
                });

                setWorkingDays(formattedDays);
            } catch (error) {
                console.error("Error fetching working days:", error);
            }
        };

        if (workingDays.length === 0) {
            fetchWorkingDays();
        }
    }, [setWorkingDays, workingDays.length]);


    const generateTasks = async () => {
        if (
            !date ||
            !time ||
            !formData.doer ||
            !formData.description ||
            !formData.frequency
        ) {
            alert("Please fill in all required fields including date and time.");
            return;
        }

        if (workingDays.length === 0) {
            alert("Working days data not loaded yet. Please try again.");
            return;
        }

        const selectedDate = new Date(date);
        const tasks = [];

        // For one-time tasks
        if (formData.frequency === "one-time") {
            const dateStr = formatDateToDDMMYYYY(selectedDate);
            if (workingDays.includes(dateStr)) {
                const taskDateTimeStr = formatDateTimeForStorage(selectedDate, time);
                tasks.push({
                    description: formData.description,
                    department: formData.department,
                    givenBy: formData.givenBy,
                    doer: formData.doer,
                    dueDate: taskDateTimeStr,
                    status: "pending",
                    frequency: formData.frequency,
                    enableReminders: formData.enableReminders,
                    requireAttachment: formData.requireAttachment,
                });
            } else {
                alert("The selected date is not a working day. Please select a working day from the list.");
                return;
            }
        } else {
            // For recurring tasks
            let currentDate = new Date(selectedDate);
            const endDate = addYears(currentDate, 2); // Generate up to 2 years ahead
            let taskCount = 0;
            const maxTasks = 365; // Safety limit

            while (currentDate <= endDate && taskCount < maxTasks) {
                let taskDateStr = "";

                if (formData.frequency.startsWith("end-of-")) {
                    const weekNum = formData.frequency === "end-of-last-week" ? -1 : parseInt(formData.frequency.split("-")[2]);
                    taskDateStr = findEndOfWeekDate(currentDate, weekNum, workingDays);
                    currentDate = addMonths(currentDate, 1);
                } else {
                    const checkDateStr = formatDateToDDMMYYYY(currentDate);
                    if (workingDays.includes(checkDateStr)) {
                        taskDateStr = checkDateStr;
                    }

                    // Increment currentDate based on frequency
                    switch (formData.frequency) {
                        case "daily":
                            currentDate = addDays(currentDate, 1);
                            break;
                        case "weekly":
                            currentDate = addDays(currentDate, 7);
                            break;
                        case "fortnightly":
                            currentDate = addDays(currentDate, 14);
                            break;
                        case "monthly":
                            currentDate = addMonths(currentDate, 1);
                            break;
                        case "quarterly":
                            currentDate = addMonths(currentDate, 3);
                            break;
                        case "yearly":
                            currentDate = addYears(currentDate, 1);
                            break;
                        default:
                            currentDate = addYears(currentDate, 10); // Break loop
                            break;
                    }
                }

                if (taskDateStr) {
                    const [d, m, y] = taskDateStr.split("/").map(Number);
                    const taskDateObj = new Date(y, m - 1, d);
                    if (taskDateObj <= endDate) {
                        const taskDateTimeStr = formatDateTimeForStorage(taskDateObj, time);
                        tasks.push({
                            description: formData.description,
                            department: formData.department,
                            givenBy: formData.givenBy,
                            doer: formData.doer,
                            dueDate: taskDateTimeStr,
                            status: "pending",
                            frequency: formData.frequency,
                            enableReminders: formData.enableReminders,
                            requireAttachment: formData.requireAttachment,
                        });
                        taskCount++;
                    }
                }
            }
        }

        setGeneratedTasks(tasks);
        setAccordionOpen(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (generatedTasks.length === 0) {
                alert("Please generate tasks first by clicking Preview Generated Tasks");
                setIsSubmitting(false);
                return;
            }

            dispatch(assignTaskInTable(generatedTasks));
            alert(`Successfully submitted ${generatedTasks.length} tasks!`);

            resetForm();
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to assign tasks. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name, e) => {
        setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    };

    return {
        generateTasks,
        handleSubmit,
        handleChange,
        handleSwitchChange
    };
};

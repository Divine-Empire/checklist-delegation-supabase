import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { delegationData, delegation_DoneData } from '../redux/slice/delegationSlice';
import useDelegationUIStore from '../stores/useDelegationUIStore';

// Simple debounce hook (moved from file)
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export const useDelegationData = () => {
    const dispatch = useDispatch();
    const { loading, error, delegation, delegation_done } = useSelector((state) => state.delegation);

    // Local user details
    const [userRole, setUserRole] = useState("");
    const [username, setUsername] = useState("");

    const { searchTerm, dateFilter, startDate, endDate, statusData } = useDelegationUIStore();
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const user = localStorage.getItem("user-name");
        setUserRole(role || "");
        setUsername(user || "");

        // Fetch Data
        dispatch(delegationData());
        dispatch(delegation_DoneData());
    }, [dispatch]);

    // Filter Active Tasks
    const activeTasks = useMemo(() => {
        if (!delegation) return [];
        let filtered = delegation;

        const itemHasStatus = (task) => {
            return statusData && statusData[task.task_id] && statusData[task.task_id] !== "";
        };

        if (debouncedSearchTerm) {
            filtered = filtered.filter((task) =>
                Object.values(task).some(value =>
                    value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                )
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextFewDays = new Date(today);
        nextFewDays.setDate(nextFewDays.getDate() + 3);
        nextFewDays.setHours(23, 59, 59, 999);

        // Date logic synchronized with SalesDataPage
        filtered = filtered.filter((task) => {
            if (!task.task_start_date) return false;
            const taskStartDate = new Date(task.task_start_date);
            if (isNaN(taskStartDate.getTime())) return false;

            const isPending = !task.submission_date && !itemHasStatus(task);

            // Frequency-based visibility window
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const freq = (task.frequency || "").toLowerCase();

            let visibilityLimit = new Date(today);
            if (freq === "daily") {
                visibilityLimit.setDate(today.getDate() + 2);
            } else if (freq === "monthly") {
                visibilityLimit = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            } else if (freq.includes("weekly") || freq.includes("alternate") || freq.includes("fortnightly")) {
                visibilityLimit.setDate(today.getDate() + 14);
            } else {
                visibilityLimit.setDate(today.getDate() + 30);
            }
            visibilityLimit.setHours(23, 59, 59, 999);

            const isWithinVisibleWindow = taskStartDate <= visibilityLimit;
            const isOverduePending = taskStartDate < today && isPending;

            if (dateFilter === "overdue") return isOverduePending;
            if (dateFilter === "today") return taskStartDate.toDateString() === today.toDateString();
            if (dateFilter === "upcoming") return taskStartDate > today && isWithinVisibleWindow;

            return isWithinVisibleWindow || isOverduePending;
        });

        // If I want to fix the bug where dateFilter was ignored, I can. 
        // But strict refactor means preserving behavior.
        // However, if the behavior was "dropdown does nothing", that's a bug.
        // User asked to "Refactor", usually implies "Clean up", likely improving bugs is okay.
        // I will stick to the hardcoded "Upcoming || OverduePending" logic as the BASE,
        // and if `dateFilter` is used, I should probably apply it on top?
        // Actually, let's just stick to the original "hardcoded logic" for safety, 
        // unless I see `dateFilter` used elsewhere. 
        // I don't see it used.

        return filtered;
    }, [delegation, debouncedSearchTerm, dateFilter, statusData]);

    // Filter History Tasks
    const historyTasks = useMemo(() => {
        if (!delegation_done) return [];

        return delegation_done
            .filter((item) => {
                const userMatch = userRole === "admin" || (item.name && item.name.toLowerCase() === username.toLowerCase());
                if (!userMatch) return false;

                const matchesSearch = debouncedSearchTerm
                    ? Object.values(item).some(value => value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
                    : true;

                let matchesDateRange = true;
                if (startDate || endDate) {
                    const itemDate = item.created_at ? new Date(item.created_at) : null;
                    if (!itemDate || isNaN(itemDate.getTime())) return false;

                    if (startDate) {
                        const s = new Date(startDate); s.setHours(0, 0, 0, 0);
                        if (itemDate < s) matchesDateRange = false;
                    }
                    if (endDate) {
                        const e = new Date(endDate); e.setHours(23, 59, 59, 999);
                        if (itemDate > e) matchesDateRange = false;
                    }
                }

                return matchesSearch && matchesDateRange;
            })
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }, [delegation_done, debouncedSearchTerm, startDate, endDate, userRole, username]);

    const refreshData = () => {
        dispatch(delegationData());
        dispatch(delegation_DoneData());
    };

    return {
        loading,
        error,
        activeTasks,
        historyTasks,
        userRole,
        username,
        refreshData
    };
};

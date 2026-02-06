import { useCallback, useEffect } from 'react';
import supabase from '../SupabaseClient';
import useCalendarStore from '../stores/useCalendarStore';
import {
    toDate,
    freqMapKey,
    normalize,
    getLastWorkingDate,
    getDatesFromTodayToLastWorkingDate,
    getNextOccurrences,
    freqColors
} from '../utils/calendarUtils';

// Helper to transform rows to tasks (internal to hook or imported if shared)
const transformToTasks = (rows) => {
    if (!rows || rows.length === 0) return [];
    let tasks = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const taskId = row.task_id || "",
            startDateStr = row.task_start_date || "",
            startDate = toDate(startDateStr),
            timeStr = row.time || "",
            status = row.status || "pending",
            remarks = row.remark || "",
            priority = row.priority || "normal";

        if (!startDate || !taskId) continue;

        tasks.push({
            taskId,
            department: row.department || "",
            givenBy: row.given_by || "",
            name: row.name || "",
            description: row.task_description || "",
            startDate,
            freq: row.frequency?.toString().trim() || "",
            time: timeStr,
            status: status,
            remarks: remarks,
            priority: priority,
            timestamp: row.created_at || "",
            rowIndex: i + 2,
            sheetType: "UNIQUE",
        });
    }
    return tasks;
};

export const useCalendarData = (userRole, userName, displayName) => {
    const role = userRole || localStorage.getItem("role") || "user";
    const uName = userName || localStorage.getItem("user-name") || "";
    const dName = displayName || localStorage.getItem("displayName") || "";

    const {
        setEvents, setDateDataMap, setAllWorkingDates, setLastWorkingDate,
        setAvailableNames, setLoading, setError, setStats, incrementCalendarKey,
        selectedNameFilter
    } = useCalendarStore();

    // --- Role filter ---
    const roleFilteredTasks = useCallback((tasks) => {
        if (!tasks || tasks.length === 0) return [];
        if (role === "admin" || role === "main admin") return tasks;
        return tasks.filter(
            (t) =>
                normalize(t.name) === normalize(uName) ||
                normalize(t.name) === normalize(dName)
        );
    }, [role, uName, dName]);

    // --- Pending filter ---
    const filterPendingTasks = useCallback((tasks) => {
        if (!tasks || tasks.length === 0) return [];
        return tasks.filter((t) => normalize(t.status || "") !== "done");
    }, []);

    // --- Name filter function ---
    const applyNameFilter = useCallback((tasks, filterName) => {
        if (!tasks || tasks.length === 0) return [];
        if (filterName === "all") return tasks;
        return tasks.filter((t) => normalize(t.name) === normalize(filterName));
    }, []);

    const generateCombinedDateMap = (uniqueTasks, workingDates) => {
        let map = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get the last working date
        const lastDate = getLastWorkingDate(workingDates);
        setLastWorkingDate(lastDate);

        // Filter working dates from today to last working date
        const filteredWorkingDates = getDatesFromTodayToLastWorkingDate(workingDates);

        // Process Unique tasks
        const filteredTasks = roleFilteredTasks(uniqueTasks);
        const pendingTasks = filterPendingTasks(filteredTasks);
        const nameFilteredTasks = applyNameFilter(pendingTasks, selectedNameFilter);

        for (const task of nameFilteredTasks) {
            if (!task.startDate) continue;

            // Get all occurrences within range
            const occurrences = getNextOccurrences(
                task,
                filteredWorkingDates,
                today,
                lastDate
            );

            for (const occurrenceDate of occurrences) {
                const dateStr = occurrenceDate.toISOString().slice(0, 10);

                if (!map[dateStr]) {
                    map[dateStr] = {
                        tasks: [],
                        tasksByTime: {},
                    };
                }

                const taskWithTime = {
                    ...task,
                    displayDate: dateStr,
                    occurrenceDate: occurrenceDate,
                };
                map[dateStr].tasks.push(taskWithTime);

                const timeKey = task.time || "no-time";
                if (!map[dateStr].tasksByTime[timeKey]) {
                    map[dateStr].tasksByTime[timeKey] = [];
                }
                map[dateStr].tasksByTime[timeKey].push(taskWithTime);
            }
        }

        return map;
    };

    const extractUniqueNames = (tasks) => {
        const names = new Set();
        tasks.forEach((task) => {
            if (task.name && task.name.trim()) {
                names.add(task.name.trim());
            }
        });
        return Array.from(names).sort();
    };

    const calculateStats = (tasks) => {
        const total = tasks.length;
        const completed = tasks.filter(
            (t) => normalize(t.status || "") === "done"
        ).length;
        const pending = total - completed;

        setStats({ total, pending, completed });
    };

    const fetchData = useCallback(async () => {
        let isMounted = true;
        try {
            setLoading(true);
            setError(null);

            // Fetch holidays
            const { data: holidaysData, error: holidaysError } = await supabase
                .from('holidays')
                .select('holiday_date');

            let workingDates = [];
            if (holidaysError) {
                console.error("Error fetching holidays:", holidaysError);
                setAllWorkingDates([]);
            } else {
                workingDates = holidaysData.map(holiday => toDate(holiday.holiday_date));
                setAllWorkingDates(workingDates);
            }

            // Fetch tasks
            let checklistQuery = supabase.from('checklist').select('*');
            if (role === 'user' && uName) checklistQuery = checklistQuery.eq('name', uName);
            const { data: checklistData, error: checklistError } = await checklistQuery;
            if (checklistError) throw checklistError;

            let delegationQuery = supabase.from('delegation').select('*');
            if (role === 'user' && uName) delegationQuery = delegationQuery.eq('name', uName);
            const { data: delegationData, error: delegationError } = await delegationQuery;
            if (delegationError) throw delegationError;

            const allTasks = [...checklistData, ...delegationData];
            const uniqueTasks = transformToTasks(allTasks);

            const names = extractUniqueNames(uniqueTasks);
            setAvailableNames(names);

            calculateStats(uniqueTasks);

            const map = generateCombinedDateMap(uniqueTasks, workingDates);
            setDateDataMap(map);

            // Create events
            const eventsArray = [];
            Object.keys(map).forEach((dateStr) => {
                const dayData = map[dateStr];
                const tasksByTime = dayData.tasksByTime || {};

                Object.keys(tasksByTime).forEach((timeKey) => {
                    const tasksAtTime = tasksByTime[timeKey];
                    const taskCount = tasksAtTime.length || 0;

                    if (taskCount === 0) return;

                    let eventStart = dateStr;
                    let eventEnd = dateStr;
                    let isAllDay = true;

                    if (timeKey !== "no-time") {
                        const timeStr = timeKey.trim();
                        let hour = 0, minute = 0;
                        const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})/);
                        if (time24Match) {
                            hour = parseInt(time24Match[1]);
                            minute = parseInt(time24Match[2]);
                            isAllDay = false;
                        } else {
                            const time12Match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            if (time12Match) {
                                hour = parseInt(time12Match[1]);
                                minute = parseInt(time12Match[2]);
                                const isPM = time12Match[3].toUpperCase() === "PM";
                                if (isPM && hour !== 12) hour += 12;
                                if (!isPM && hour === 12) hour = 0;
                                isAllDay = false;
                            }
                        }

                        if (!isAllDay) {
                            eventStart = `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
                            const endHour = (hour + 1) % 24;
                            eventEnd = `${dateStr}T${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
                        }
                    }

                    eventsArray.push({
                        id: `${dateStr}-${timeKey}`,
                        start: eventStart,
                        end: isAllDay ? undefined : eventEnd,
                        allDay: isAllDay,
                        title: `${taskCount} Tasks`,
                        extendedProps: {
                            dateStr: dateStr,
                            timeKey: timeKey,
                            taskCount: taskCount,
                            tasks: tasksAtTime,
                        },
                        backgroundColor: freqColors.oneTime,
                    });
                });
            });

            setEvents(eventsArray);
            incrementCalendarKey();
            setError(null);

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load data: " + (err.message || "Unknown error"));
            setEvents([]);
            setDateDataMap({});
            setStats({ total: 0, pending: 0, completed: 0 });
            incrementCalendarKey();
        } finally {
            setLoading(false);
        }
    }, [
        role, uName, dName, selectedNameFilter,
        roleFilteredTasks, filterPendingTasks, applyNameFilter
    ]);

    useEffect(() => {
        let cancelled = false;
        const loadData = async () => {
            if (!cancelled) await fetchData();
        };
        loadData();

        const intervalId = setInterval(() => {
            if (!cancelled) fetchData();
        }, 5 * 60 * 1000);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [fetchData]);

    return { fetchData };
};

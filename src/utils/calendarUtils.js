// --- Frequency Color Map ---
export const freqColors = {
    daily: "#a21caf",
    weekly: "#38bdf8",
    monthly: "#f59e42",
    oneTime: "#10b981",
};

export const freqLabels = {
    daily: "Daily Tasks",
    weekly: "Weekly Tasks",
    monthly: "Monthly Tasks",
    oneTime: "One-Time Tasks",
};

// --- Date helpers ---
export const toDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === "number") return new Date(d);
    if (typeof d === "string") {
        let t = Date.parse(d);
        if (!isNaN(t)) return new Date(t);
        let m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
    }
    return null;
};

export const formatDate = (d) => {
    d = toDate(d);
    if (!d) return "";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
};

export const isSameDay = (d1, d2) => {
    d1 = toDate(d1);
    d2 = toDate(d2);
    if (!d1 || !d2) return false;
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const freqMapKey = (freq) => {
    if (!freq) return "oneTime";
    freq = freq.toLowerCase();
    if (freq.startsWith("d")) return "daily";
    if (freq.startsWith("w")) return "weekly";
    if (freq.startsWith("m")) return "monthly";
    return "oneTime";
};

export const normalize = (val) => (val || "").trim().toLowerCase();

// Helper to get dates from today to last working date
export const getDatesFromTodayToLastWorkingDate = (workingDates) => {
    if (!workingDates || workingDates.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the last working date
    const sortedDates = [...workingDates].sort((a, b) => a - b);
    const lastWorkingDate = sortedDates[sortedDates.length - 1];

    if (!lastWorkingDate) return [];

    return workingDates.filter((date) => {
        return date > today && date <= lastWorkingDate;
    });
};

// Helper to get last working date from working dates array
export const getLastWorkingDate = (workingDates) => {
    if (!workingDates || workingDates.length === 0) return null;

    const sortedDates = [...workingDates].sort((a, b) => a - b);
    return sortedDates[sortedDates.length - 1];
};

// Helper to calculate next occurrence dates based on frequency within range
export const getNextOccurrences = (
    task,
    workingDates,
    currentDate,
    lastWorkingDate
) => {
    const { startDate, freq } = task;
    const freqType = freqMapKey(freq);
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const occurrences = [];
    const taskStartDate = toDate(startDate);

    if (!taskStartDate || !lastWorkingDate) return occurrences;

    // If task is in the past, find next occurrence
    let nextDate = new Date(taskStartDate);

    // For one-time tasks, just check if it's within range
    if (freqType === "oneTime") {
        if (nextDate > today && nextDate <= lastWorkingDate) {
            occurrences.push(nextDate);
        }
        return occurrences;
    }

    // For recurring tasks, calculate occurrences within range
    let iterationCount = 0;
    const maxIterations = 1000; // Safety limit for long ranges

    while (nextDate <= lastWorkingDate && iterationCount < maxIterations) {
        if (nextDate > today) {
            occurrences.push(new Date(nextDate));
        }

        // Calculate next date based on frequency
        if (freqType === "daily") {
            nextDate.setDate(nextDate.getDate() + 1);
        } else if (freqType === "weekly") {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (freqType === "monthly") {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
            break;
        }

        iterationCount++;
    }

    // Filter to only include dates that are in working dates
    return occurrences.filter((date) =>
        workingDates.some((workingDate) => isSameDay(workingDate, date))
    );
};

export const formatDateTimeToDDMMYYYY = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const formatDateToDDMMYYYY = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const parseGoogleSheetsDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";

    if (
        typeof dateTimeStr === "string" &&
        dateTimeStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{1,2}:\d{1,2}$/)
    ) {
        const [datePart, timePart] = dateTimeStr.split(" ");
        const [day, month, year] = datePart.split("/");
        const [hours, minutes, seconds] = timePart.split(":");

        const paddedDay = day.padStart(2, "0");
        const paddedMonth = month.padStart(2, "0");
        const paddedHours = hours.padStart(2, "0");
        const paddedMinutes = minutes.padStart(2, "0");
        const paddedSeconds = seconds.padStart(2, "0");

        return `${paddedDay}/${paddedMonth}/${year} ${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }

    if (
        typeof dateTimeStr === "string" &&
        dateTimeStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    ) {
        const parts = dateTimeStr.split("/");
        if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            const month = parts[1].padStart(2, "0");
            const year = parts[2];
            return `${day}/${month}/${year} 00:00:00`;
        }
        return dateTimeStr + " 00:00:00";
    }

    if (typeof dateTimeStr === "string" && dateTimeStr.startsWith("Date(")) {
        const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateTimeStr);
        if (match) {
            const year = Number.parseInt(match[1], 10);
            const month = Number.parseInt(match[2], 10);
            const day = Number.parseInt(match[3], 10);
            return `${day.toString().padStart(2, "0")}/${(month + 1)
                .toString()
                .padStart(2, "0")}/${year} 00:00:00`;
        }
    }

    try {
        const date = new Date(dateTimeStr);
        if (!isNaN(date.getTime())) {
            if (dateTimeStr.includes(":") || dateTimeStr.includes("T")) {
                return formatDateTimeToDDMMYYYY(date);
            } else {
                return formatDateToDDMMYYYY(date) + " 00:00:00";
            }
        }
    } catch (error) {
        console.error("Error parsing datetime:", error);
    }

    if (
        typeof dateTimeStr === "string" &&
        dateTimeStr.includes("/") &&
        !dateTimeStr.includes(":")
    ) {
        return dateTimeStr + " 00:00:00";
    }

    return dateTimeStr;
};

export const formatDateTimeForDisplay = (dateTimeStr) => {
    if (!dateTimeStr) return "—";

    if (
        typeof dateTimeStr === "string" &&
        dateTimeStr.match(/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/)
    ) {
        return dateTimeStr;
    }

    if (
        typeof dateTimeStr === "string" &&
        dateTimeStr.match(/^\d{2}\/\d{2}\/\d{4}$/)
    ) {
        return dateTimeStr;
    }

    return parseGoogleSheetsDateTime(dateTimeStr) || "—";
};

import { useCallback, useEffect, useMemo } from 'react';
import supabase from '../SupabaseClient';
import useApprovalStore from '../store/useApprovalStore';

export const useApprovalData = () => {
    // Access state and setters from store
    const {
        activeApprovalTab,
        searchTerm,
        selectedMembers,
        startDate,
        endDate,
        historyData,
        delegationHistoryData,
        editedAdminStatus,
        savingEdits,
        selectedHistoryItems,
        markingAsDone,
        setLoading,
        setError,
        setSuccessMessage,
        setHistoryData,
        setDelegationHistoryData,
        setMembersList,
        setEditingRows,
        setEditedAdminStatus,
        setSavingEdits,
        setSelectedHistoryItems,
        setMarkingAsDone,
        setConfirmationModal
    } = useApprovalStore();

    const userRole = localStorage.getItem("role");
    const username = localStorage.getItem("user-name");

    // --- Helpers ---

    // Format date-time to DD/MM/YYYY HH:MM:SS
    const formatDateTimeToDDMMYYYY = (date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const parseDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return "";
        if (typeof dateTimeStr === "string" && dateTimeStr.includes("T")) {
            const date = new Date(dateTimeStr);
            return formatDateTimeToDDMMYYYY(date);
        }
        if (typeof dateTimeStr === "string" && dateTimeStr.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)) {
            return dateTimeStr;
        }
        if (typeof dateTimeStr === "string" && dateTimeStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateTimeStr;
        }
        return dateTimeStr;
    };

    const parseDateFromDDMMYYYY = (dateStr) => {
        if (!dateStr || typeof dateStr !== "string") return null;
        const datePart = dateStr.includes(" ") ? dateStr.split(" ")[0] : dateStr;
        const parts = datePart.split("/");
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
    };

    // --- Data Fetching ---

    const fetchSheetData = useCallback(async () => {
        try {
            setLoading(true);
            const currentUsername = localStorage.getItem("user-name");
            const currentUserRole = localStorage.getItem("role");

            // Fetch Checklist data
            let checklistQuery = supabase
                .from('checklist')
                .select('*')
                .not('submission_date', 'is', null)
                .not('status', 'is', null);

            if (currentUserRole === 'user' && currentUsername) {
                checklistQuery = checklistQuery.eq('name', currentUsername);
            }

            const { data: checklistData, error: checklistError } = await checklistQuery;

            if (checklistError) throw new Error(`Failed to fetch checklist data: ${checklistError.message}`);

            // Fetch Delegation data
            let delegationQuery = supabase
                .from('delegation')
                .select('*')
                .not('submission_date', 'is', null)
                .not('status', 'is', null);

            if (currentUserRole === 'user' && currentUsername) {
                delegationQuery = delegationQuery.eq('name', currentUsername);
            }

            let { data: delegationData, error: delegationError } = await delegationQuery;

            if (delegationError) {
                console.warn(`Failed to fetch delegation data: ${delegationError.message}`);
                delegationData = [];
            }

            const membersSet = new Set();

            // Process Checklist data
            const processedChecklistData = checklistData.map((row, index) => {
                const assignedTo = row.name || "Unassigned";
                membersSet.add(assignedTo);

                const taskId = row.task_id || "";
                const stableId = taskId
                    ? `checklist_task_${taskId}_${index + 1}`
                    : `checklist_row_${index + 1}_${Math.random().toString(36).substring(2, 15)}`;

                return {
                    _id: stableId,
                    _rowIndex: index + 1,
                    _taskId: taskId,
                    _sheetType: 'checklist',
                    task_id: row.task_id,
                    task_description: row.task_description,
                    name: row.name,
                    given_by: row.given_by,
                    department: row.department,
                    task_start_date: parseDateTime(row.task_start_date),
                    planned_date: parseDateTime(row.planned_date),
                    frequency: row.frequency,
                    enable_reminders: row.enable_reminders,
                    require_attachment: row.require_attachment,
                    submission_date: parseDateTime(row.submission_date),
                    status: row.status,
                    remark: row.remark,
                    image: row.image,
                    admin_done: row.admin_done,
                };
            });

            // Process Delegation data
            const processedDelegationData = delegationData.map((row, index) => {
                const assignedTo = row.name || "Unassigned";
                membersSet.add(assignedTo);

                const taskId = row.task_id || "";
                const stableId = taskId
                    ? `delegation_task_${taskId}_${index + 1}`
                    : `delegation_row_${index + 1}_${Math.random().toString(36).substring(2, 15)}`;

                return {
                    _id: stableId,
                    _rowIndex: index + 1,
                    _taskId: taskId,
                    _sheetType: 'delegation',
                    task_id: row.task_id,
                    task_description: row.task_description,
                    name: row.name,
                    given_by: row.given_by,
                    department: row.department,
                    task_start_date: parseDateTime(row.task_start_date),
                    planned_date: parseDateTime(row.planned_date),
                    frequency: row.frequency || row.freq,
                    enable_reminders: row.enable_reminder || row.enable_reminders,
                    require_attachment: row.require_attachment,
                    submission_date: parseDateTime(row.submission_date),
                    status: row.status,
                    remark: row.remarks || row.remark,
                    image: row.image || "",
                    admin_done: row.admin_done || "",
                };
            });

            setMembersList(Array.from(membersSet).sort());
            setHistoryData(processedChecklistData);
            setDelegationHistoryData(processedDelegationData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching sheet data:", error);
            setError("Failed to load account data: " + error.message);
            setLoading(false);
        }
    }, [setError, setHistoryData, setDelegationHistoryData, setMembersList, setLoading]);

    // Initial Fetch
    useEffect(() => {
        fetchSheetData();
    }, [fetchSheetData]);


    // --- Logic & Actions ---

    const handleEditClick = (historyItem) => {
        const rowId = historyItem._id;
        setEditingRows((prev) => {
            const newSet = new Set(prev);
            newSet.add(rowId);
            return newSet
        });
        setEditedAdminStatus((prev) => ({
            ...prev,
            [rowId]: historyItem.admin_done || "",
        }));
    };

    const handleCancelEdit = (rowId) => {
        setEditingRows((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rowId);
            return newSet;
        });
        setEditedAdminStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[rowId];
            return newStatus;
        });
    };

    const handleSaveEdit = async (historyItem) => {
        const rowId = historyItem._id;
        const newStatus = editedAdminStatus[rowId];
        const sheetType = historyItem._sheetType || 'checklist';
        const targetTable = sheetType === 'delegation' ? 'delegation' : 'checklist';
        const taskId = historyItem._taskId || historyItem.task_id;

        if (savingEdits.has(rowId)) return;

        setSavingEdits((prev) => {
            const newSet = new Set(prev);
            newSet.add(rowId);
            return newSet;
        });

        try {
            const statusToSend = newStatus === "" || newStatus === undefined ? "" : newStatus;

            const { error } = await supabase
                .from(targetTable)
                .update({ admin_done: statusToSend })
                .eq('task_id', taskId);

            if (error) throw new Error(error.message);

            const updatedStatus = newStatus === "" || newStatus === undefined ? "" : newStatus;

            if (sheetType === 'delegation') {
                setDelegationHistoryData((prev) =>
                    prev.map((item) =>
                        item._id === rowId ? { ...item, admin_done: updatedStatus } : item
                    )
                );
            } else {
                setHistoryData((prev) =>
                    prev.map((item) =>
                        item._id === rowId ? { ...item, admin_done: updatedStatus } : item
                    )
                );
            }

            setEditingRows((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowId);
                return newSet;
            });

            setEditedAdminStatus((prev) => {
                const newStatusObj = { ...prev };
                delete newStatusObj[rowId];
                return newStatusObj;
            });

            setSuccessMessage("Admin status updated successfully!");
            setTimeout(() => { fetchSheetData(); }, 3000);

        } catch (error) {
            console.error("Error updating Admin status:", error);
            setSuccessMessage(`Failed to update Admin status: ${error.message}`);
        } finally {
            setSavingEdits((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowId);
                return newSet;
            });
        }
    };

    const handleMarkMultipleDone = () => {
        if (selectedHistoryItems.length === 0) return;
        if (markingAsDone) return;
        setConfirmationModal({
            isOpen: true,
            itemCount: selectedHistoryItems.length,
        });
    };

    const confirmMarkDone = async () => {
        setConfirmationModal({ isOpen: false, itemCount: 0 });
        setMarkingAsDone(true);

        try {
            const checklistItems = selectedHistoryItems.filter(item => item._sheetType === 'checklist');
            const delegationItems = selectedHistoryItems.filter(item => item._sheetType === 'delegation');

            if (checklistItems.length > 0) {
                const checklistTaskIds = checklistItems.map(item => item._taskId || item.task_id);
                const { error } = await supabase
                    .from('checklist')
                    .update({ admin_done: "Done" })
                    .in('task_id', checklistTaskIds);
                if (error) throw new Error(error.message);
            }

            if (delegationItems.length > 0) {
                const delegationTaskIds = delegationItems.map(item => item._taskId || item.task_id);
                const { error } = await supabase
                    .from('delegation')
                    .update({ admin_done: "Done" })
                    .in('task_id', delegationTaskIds);
                if (error) throw new Error(error.message);
            }

            // Client-side update
            setHistoryData((prev) => prev.filter(item => !selectedHistoryItems.some(selected => selected._id === item._id)));
            setDelegationHistoryData((prev) => prev.filter(item => !selectedHistoryItems.some(selected => selected._id === item._id)));

            setSelectedHistoryItems([]);
            setSuccessMessage(`Successfully marked ${selectedHistoryItems.length} items as Admin Done!`);
            setTimeout(() => { fetchSheetData(); }, 2000);

        } catch (error) {
            console.error("Error marking tasks as Admin Done:", error);
            setSuccessMessage(`Failed to mark tasks as Admin Done: ${error.message}`);
        } finally {
            setMarkingAsDone(false);
        }
    };

    // --- Computed Data ---
    const filterData = (data) => {
        return data
            .filter((item) => {
                const matchesSearch = searchTerm
                    ? Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                    : true;
                const matchesMember = selectedMembers.length > 0 ? selectedMembers.includes(item.name) : true;

                let matchesDateRange = true;
                if (startDate || endDate) {
                    const itemDate = parseDateFromDDMMYYYY(item.submission_date);
                    if (!itemDate) return false;
                    if (startDate) {
                        const startDateObj = new Date(startDate);
                        startDateObj.setHours(0, 0, 0, 0);
                        if (itemDate < startDateObj) matchesDateRange = false;
                    }
                    if (endDate) {
                        const endDateObj = new Date(endDate);
                        endDateObj.setHours(23, 59, 59, 999);
                        if (itemDate > endDateObj) matchesDateRange = false;
                    }
                }
                return matchesSearch && matchesMember && matchesDateRange;
            })
            .sort((a, b) => {
                const dateA = parseDateFromDDMMYYYY(a.submission_date || "");
                const dateB = parseDateFromDDMMYYYY(b.submission_date || "");
                if (!dateA) return 1;
                if (!dateB) return -1;
                return dateB.getTime() - dateA.getTime();
            });
    }

    const filteredHistoryData = useMemo(() => filterData(historyData), [historyData, searchTerm, selectedMembers, startDate, endDate]);
    const filteredDelegationHistoryData = useMemo(() => filterData(delegationHistoryData), [delegationHistoryData, searchTerm, selectedMembers, startDate, endDate]);

    const getFilteredMembersList = () => {
        if (userRole === "admin") return useApprovalStore.getState().membersList; // Access latest list
        return useApprovalStore.getState().membersList.filter((member) => member.toLowerCase() === username.toLowerCase());
    };

    return {
        // Data
        filteredHistoryData,
        filteredDelegationHistoryData,
        getFilteredMembersList,
        username,
        userRole,

        // Actions
        fetchSheetData,
        handleEditClick,
        handleCancelEdit,
        handleSaveEdit,
        handleMarkMultipleDone,
        confirmMarkDone
    };
};

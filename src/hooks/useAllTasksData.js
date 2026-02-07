import { useCallback, useEffect, useMemo, useRef } from 'react';
import useAllTasksStore from '../store/useAllTasksStore';

// Google Sheets configuration
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz47q4SiLvJJom8dRGteqjhufs0Iui4rYTLMeTYqOgY_MFrS0C0o0XkRCPzAOdEeg4jqg/exec";
const SHEET_NAME = "DATA";
const SHEET_ID = "1pso64b1nmDBPtq9V5Ay0L93smot03LKat_K0wka0XDY";

/**
 * Date formatting utilities
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
};

const parseFormattedDate = (formattedDate) => {
    if (!formattedDate) return '';
    try {
        if (formattedDate.includes('/')) {
            const [day, month, year] = formattedDate.split('/');
            const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
        if (formattedDate.includes('T')) {
            return formattedDate.split('T')[0];
        }
        return formattedDate;
    } catch (error) {
        console.error("Error parsing date:", error);
        return formattedDate;
    }
};

const formatDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Custom hook for AllTasks data fetching and operations
 */
export const useAllTasksData = () => {
    const {
        tasks,
        tableHeaders,
        editedTasks,
        selectedTasks,
        selectedFiles,
        searchQuery,
        filterStatus,
        filterFrequency,
        pageSize,
        currentPage,
        hasMoreTasks,
        isLoading,
        username,
        isAdmin,
        setTasks,
        setTableHeaders,
        setEditedTasks,
        setSelectedFiles,
        setCurrentPage,
        setHasMoreTasks,
        setIsLoading,
        setIsSubmitting,
        setError,
        setUsername,
        setIsAdmin,
        showToast,
        resetSelections,
        clearFilesForTasks
    } = useAllTasksStore();

    // Ref for infinite scroll
    const observerRef = useRef(null);

    // Check user credentials on mount
    useEffect(() => {
        const storedUsername = sessionStorage.getItem('username');
        if (!storedUsername) {
            window.location.href = '/login';
            return;
        }
        setUsername(storedUsername);
        setIsAdmin(storedUsername.toLowerCase() === 'admin');
    }, [setUsername, setIsAdmin]);

    // Fetch tasks from Google Sheets
    const fetchTasks = useCallback(async () => {
        if (!username) return;

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('action', 'fetchTasks');
            formData.append('sheetId', SHEET_ID);
            formData.append('sheetName', SHEET_NAME);

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data && data.success) {
                const colEIndex = 4;  // Username column
                const colLIndex = 11; // Date column
                const colMIndex = 12; // Completion column

                const colEId = data.headers[colEIndex]?.id || 'colE';
                const colLId = data.headers[colLIndex]?.id || 'colL';
                const colMId = data.headers[colMIndex]?.id || 'colM';

                // Use current date for filtering
                const today = new Date('2025-04-15'); // Hardcoded for testing
                const todayString = formatDateString(today);

                const filteredTasks = data.tasks
                    .filter(task => {
                        if (isAdmin) return true;
                        const taskUsername = task[colEId] ? task[colEId].toString().trim().toLowerCase() : '';
                        return taskUsername === username.trim().toLowerCase();
                    })
                    .filter(task => {
                        const taskDate = task[colLId] ? parseFormattedDate(task[colLId]) : '';
                        const isValidDate = taskDate === todayString;
                        const hasColL = task[colLId] !== undefined &&
                            task[colLId] !== null &&
                            task[colLId].toString().trim() !== '';
                        const isColMEmpty = task[colMId] === undefined ||
                            task[colMId] === null ||
                            task[colMId].toString().trim() === '';
                        return hasColL && isValidDate && isColMEmpty;
                    })
                    .map(task => {
                        const filteredTask = {
                            _id: task._id,
                            _rowIndex: task._rowIndex,
                            [colLId]: task[colLId],
                            [colMId]: task[colMId]
                        };
                        data.headers.forEach(header => {
                            filteredTask[header.id] = task[header.id];
                        });
                        return filteredTask;
                    });

                const visibleHeaders = data.headers.filter((header, index) =>
                    index >= 1 && index <= 10
                );

                setTableHeaders(visibleHeaders);
                setTasks(filteredTasks);
                setCurrentPage(1);
                setHasMoreTasks(filteredTasks.length > pageSize);

                const initialEditedTasks = {};
                filteredTasks.forEach(task => {
                    initialEditedTasks[task._id] = { ...task };
                });
                setEditedTasks(initialEditedTasks);
            } else {
                console.error("Error fetching tasks:", data?.error || "Unknown error");
                setError(data?.error || "Failed to load tasks");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Network error or failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    }, [username, isAdmin, pageSize, setTasks, setTableHeaders, setEditedTasks, setCurrentPage, setHasMoreTasks, setIsLoading, setError]);

    // Effect to fetch tasks when username changes
    useEffect(() => {
        if (username) {
            fetchTasks();
        }
    }, [username, isAdmin, fetchTasks]);

    // Filtered and paginated tasks
    const filteredPaginatedTasks = useMemo(() => {
        return tasks
            .filter((task) => {
                const statusHeader = tableHeaders.find(h =>
                    h.label.toLowerCase().includes('status')
                )?.id;
                const frequencyHeader = tableHeaders.find(h =>
                    h.label.toLowerCase().includes('frequency')
                )?.id;

                if (filterStatus !== "all" &&
                    statusHeader &&
                    task[statusHeader]?.toString().toLowerCase() !== filterStatus) {
                    return false;
                }

                if (filterFrequency !== "all" &&
                    frequencyHeader &&
                    task[frequencyHeader]?.toString().toLowerCase() !== filterFrequency) {
                    return false;
                }

                if (searchQuery) {
                    const searchLower = searchQuery.toLowerCase();
                    return Object.values(task).some(value =>
                        value && value.toString().toLowerCase().includes(searchLower)
                    );
                }

                return true;
            })
            .slice(0, currentPage * pageSize);
    }, [tasks, tableHeaders, filterStatus, filterFrequency, searchQuery, currentPage, pageSize]);

    // Last element ref callback for infinite scroll
    const lastTaskElementRef = useCallback(node => {
        if (isLoading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreTasks) {
                setCurrentPage(currentPage + 1);
            }
        });

        if (node) observerRef.current.observe(node);
    }, [isLoading, hasMoreTasks, currentPage, setCurrentPage]);

    // Handle file selection
    const handleFileSelect = useCallback((taskId, event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFiles({ ...selectedFiles, [taskId]: file });
            showToast(`File selected for task: ${file.name}`, "success");
            uploadFile(taskId, file);
        }
    }, [selectedFiles, setSelectedFiles, showToast]);

    // Upload file
    const uploadFile = useCallback(async (taskId, file) => {
        if (!file) {
            showToast("No file selected", "error");
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result.split(',')[1];

                const formData = new FormData();
                formData.append('action', 'uploadFile');
                formData.append('sheetName', SHEET_NAME);
                formData.append('taskId', taskId);
                formData.append('fileName', file.name);
                formData.append('fileData', base64Data);
                formData.append('rowIndex', tasks.find(t => t._id === taskId)?._rowIndex);
                formData.append('columnP', 'P');
                formData.append('folderUrl', 'https://drive.google.com/drive/u/0/folders/1TBpIcv5bbAsmlje7lpnPFpJRDY5nekTE');

                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        showToast(`File uploaded successfully: ${file.name}`, "success");
                    } else {
                        throw new Error(result.error || "Failed to upload file");
                    }
                } catch (err) {
                    showToast("Failed to upload file", "error");
                    console.error("Error uploading file:", err);
                }
            };

            reader.readAsDataURL(file);
        } catch (error) {
            showToast("An error occurred during file upload", "error");
            console.error("Error in upload process:", error);
        }
    }, [tasks, showToast]);

    // Form submission handler
    const handleSubmit = useCallback(async () => {
        if (selectedTasks.length === 0) {
            showToast("Please select at least one task", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const tasksToUpdate = selectedTasks.map(taskId => {
                const task = editedTasks[taskId];
                const updates = {};

                tableHeaders.forEach(header => {
                    if (header.label.toLowerCase().includes('date')) {
                        const parsedDate = parseFormattedDate(task[header.id]);
                        updates[header.id] = parsedDate;
                    } else {
                        updates[header.id] = task[header.id];
                    }
                });

                // Add today's date to column M
                const today = new Date();
                const formattedToday = formatDateString(today);
                updates['colM'] = formattedToday;

                return {
                    rowIndex: task._rowIndex,
                    updates: updates
                };
            });

            const formData = new FormData();
            formData.append('action', 'updateTasks');
            formData.append('sheetName', SHEET_NAME);
            formData.append('tasks', JSON.stringify(tasksToUpdate));

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setTasks(tasks.map(task =>
                    selectedTasks.includes(task._id)
                        ? { ...editedTasks[task._id] }
                        : task
                ));

                clearFilesForTasks(selectedTasks);
                resetSelections();

                showToast(`Successfully updated ${selectedTasks.length} tasks`, "success");
            } else {
                throw new Error(result.error || "Failed to update tasks");
            }
        } catch (error) {
            console.error("Error updating tasks:", error);
            showToast("An error occurred while updating tasks", "error");
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedTasks, editedTasks, tableHeaders, tasks, setTasks, setIsSubmitting, showToast, resetSelections, clearFilesForTasks]);

    // Logout handler
    const handleLogout = useCallback(() => {
        sessionStorage.removeItem('username');
        window.location.href = '/login';
    }, []);

    return {
        // Data
        filteredPaginatedTasks,

        // Utilities
        formatDate,

        // Refs
        lastTaskElementRef,

        // Actions
        fetchTasks,
        handleFileSelect,
        handleSubmit,
        handleLogout
    };
};

export default useAllTasksData;

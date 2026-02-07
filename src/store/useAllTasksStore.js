import { create } from 'zustand';

/**
 * Zustand store for AllTasks page UI state
 */
const useAllTasksStore = create((set, get) => ({
    // Task data
    tasks: [],
    tableHeaders: [],
    editedTasks: {},

    // Selection state
    selectedTasks: [],
    selectedColumnValues: {},
    selectedFiles: {},

    // Filter state
    searchQuery: '',
    filterStatus: 'all',
    filterFrequency: 'all',

    // Pagination
    pageSize: 10,
    currentPage: 1,
    hasMoreTasks: true,

    // UI state
    isLoading: true,
    isSubmitting: false,
    error: null,
    toast: { show: false, message: '', type: '' },

    // User info
    username: '',
    isAdmin: false,

    // Setters
    setTasks: (tasks) => set({ tasks }),
    setTableHeaders: (headers) => set({ tableHeaders: headers }),
    setEditedTasks: (edited) => set({ editedTasks: edited }),

    setSelectedTasks: (selected) => set({ selectedTasks: selected }),
    setSelectedColumnValues: (values) => set({ selectedColumnValues: values }),
    setSelectedFiles: (files) => set({ selectedFiles: files }),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterStatus: (status) => set({ filterStatus: status }),
    setFilterFrequency: (freq) => set({ filterFrequency: freq }),

    setCurrentPage: (page) => set({ currentPage: page }),
    setHasMoreTasks: (has) => set({ hasMoreTasks: has }),

    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
    setError: (error) => set({ error }),

    setUsername: (name) => set({ username: name }),
    setIsAdmin: (admin) => set({ isAdmin: admin }),

    // Toast actions
    showToast: (message, type) => {
        set({ toast: { show: true, message, type } });
        setTimeout(() => {
            set({ toast: { show: false, message: '', type: '' } });
        }, 3000);
    },

    // Task selection actions
    toggleTaskSelection: (taskId) => {
        const { selectedTasks, selectedColumnValues } = get();
        const isSelected = selectedTasks.includes(taskId);

        if (isSelected) {
            // Deselect
            set({
                selectedTasks: selectedTasks.filter(id => id !== taskId),
                selectedColumnValues: Object.fromEntries(
                    Object.entries(selectedColumnValues).filter(([key]) => key !== taskId)
                )
            });
        } else {
            // Select
            set({
                selectedTasks: [...selectedTasks, taskId],
                selectedColumnValues: { ...selectedColumnValues, [taskId]: '' }
            });
        }
    },

    toggleAllTasks: (allTaskIds) => {
        const { selectedTasks } = get();
        if (selectedTasks.length === allTaskIds.length) {
            set({ selectedTasks: [], selectedColumnValues: {} });
        } else {
            const newValues = {};
            allTaskIds.forEach(id => { newValues[id] = ''; });
            set({ selectedTasks: allTaskIds, selectedColumnValues: newValues });
        }
    },

    handleColumnOChange: (taskId, value) => {
        const { selectedColumnValues } = get();
        set({ selectedColumnValues: { ...selectedColumnValues, [taskId]: value } });
    },

    handleTaskEdit: (taskId, fieldId, value) => {
        const { editedTasks } = get();
        set({
            editedTasks: {
                ...editedTasks,
                [taskId]: { ...editedTasks[taskId], [fieldId]: value }
            }
        });
    },

    // Reset state
    resetSelections: () => set({
        selectedTasks: [],
        selectedColumnValues: {},
        selectedFiles: {}
    }),

    // Clear files for specific tasks
    clearFilesForTasks: (taskIds) => {
        const { selectedFiles } = get();
        const newFiles = { ...selectedFiles };
        taskIds.forEach(id => delete newFiles[id]);
        set({ selectedFiles: newFiles });
    }
}));

export default useAllTasksStore;

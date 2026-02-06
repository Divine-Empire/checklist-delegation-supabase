import { create } from 'zustand';

const useQuickTaskUIStore = create((set) => ({
    // --- UI State ---
    activeTab: 'checklist', // 'checklist' | 'delegation'
    searchTerm: "",
    nameFilter: "",
    freqFilter: "",
    sortConfig: { key: null, direction: 'asc' },

    // --- Dropdowns ---
    dropdownOpen: { name: false, frequency: false },

    // --- Selection ---
    selectedTasks: [], // Array of full task objects

    // --- Editing ---
    editingTaskId: null,
    editFormData: {},

    // --- Actions ---
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setNameFilter: (name) => set({ nameFilter: name }),
    setFreqFilter: (freq) => set({ freqFilter: freq }),

    setSortConfig: (key) => set((state) => {
        let direction = 'asc';
        if (state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        return { sortConfig: { key, direction } };
    }),

    toggleDropdown: (key) => set((state) => ({
        dropdownOpen: { ...state.dropdownOpen, [key]: !state.dropdownOpen[key] }
    })),
    closeDropdowns: () => set({ dropdownOpen: { name: false, frequency: false } }),

    // Selection Actions
    toggleTaskSelection: (task) => set((state) => {
        const exists = state.selectedTasks.find(t => t.task_id === task.task_id);
        if (exists) {
            return { selectedTasks: state.selectedTasks.filter(t => t.task_id !== task.task_id) };
        } else {
            return { selectedTasks: [...state.selectedTasks, task] };
        }
    }),
    selectAllTasks: (tasks) => set({ selectedTasks: tasks }),
    clearSelection: () => set({ selectedTasks: [] }),

    // Edit Actions
    startEditing: (task) => set({
        editingTaskId: task.task_id,
        editFormData: {
            task_id: task.task_id,
            department: task.department || '',
            given_by: task.given_by || '',
            name: task.name || '',
            task_description: task.task_description || '',
            task_start_date: task.task_start_date || '',
            frequency: task.frequency || '',
            enable_reminder: task.enable_reminder || '',
            require_attachment: task.require_attachment || '',
            remark: task.remark || ''
        }
    }),
    cancelEditing: () => set({ editingTaskId: null, editFormData: {} }),
    updateEditForm: (field, value) => set((state) => ({
        editFormData: { ...state.editFormData, [field]: value }
    })),
}));

export default useQuickTaskUIStore;

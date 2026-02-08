// src/stores/useHolidayStore.js
import { create } from 'zustand';

const useHolidayStore = create((set) => ({
    // Holidays state
    holidays: [],
    formData: { day: "", date: "", name: "" },
    editIndex: null,
    modalOpen: false,
    loading: false,
    fetchLoading: false,
    
    // Working days state
    showWorkingDays: false,
    workingDays: [],
    workingDayFormData: { working_date: "", day: "" },
    workingDayEditIndex: null,
    workingDayModalOpen: false,
    workingDayLoading: false,
    
    // Setters
    setHolidays: (holidays) => set({ holidays }),
    setFormData: (formData) => set((state) => ({
        formData: { ...state.formData, ...formData }
    })),
    setEditIndex: (editIndex) => set({ editIndex }),
    setModalOpen: (modalOpen) => set({ modalOpen }),
    setLoading: (loading) => set({ loading }),
    setFetchLoading: (fetchLoading) => set({ fetchLoading }),
    
    setShowWorkingDays: (showWorkingDays) => set({ showWorkingDays }),
    setWorkingDays: (workingDays) => set({ workingDays }),
    setWorkingDayFormData: (workingDayFormData) => set((state) => ({
        workingDayFormData: { ...state.workingDayFormData, ...workingDayFormData }
    })),
    setWorkingDayEditIndex: (workingDayEditIndex) => set({ workingDayEditIndex }),
    setWorkingDayModalOpen: (workingDayModalOpen) => set({ workingDayModalOpen }),
    setWorkingDayLoading: (workingDayLoading) => set({ workingDayLoading }),
    
    resetFormData: () => set({ 
        formData: { day: "", date: "", name: "" },
        editIndex: null 
    }),
    
    resetWorkingDayFormData: () => set({
        workingDayFormData: { working_date: "", day: "" },
        workingDayEditIndex: null
    })
}));

export default useHolidayStore;
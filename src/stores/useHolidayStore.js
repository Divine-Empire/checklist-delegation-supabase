import { create } from 'zustand';

const useHolidayStore = create((set) => ({
    // --- Holiday State ---
    holidays: [],
    modalOpen: false,
    editIndex: null,
    formData: { day: "", date: "", name: "" }, // date is YYYY-MM-DD
    loading: false,
    fetchLoading: false,

    // --- Working Day State ---
    workingDays: [],
    workingDayModalOpen: false,
    workingDayEditIndex: null,
    workingDayFormData: { working_date: "", day: "" },
    workingDayLoading: false,

    // --- UI State ---
    showWorkingDays: false,

    // --- Actions ---
    setHolidays: (holidays) => set({ holidays }),
    setModalOpen: (open) => set({ modalOpen: open }),
    setEditIndex: (index) => set({ editIndex: index }),
    setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
    resetFormData: () => set({ formData: { day: "", date: "", name: "" } }),
    setLoading: (loading) => set({ loading }),
    setFetchLoading: (loading) => set({ fetchLoading: loading }),

    setWorkingDays: (workingDays) => set({ workingDays }),
    setWorkingDayModalOpen: (open) => set({ workingDayModalOpen: open }),
    setWorkingDayEditIndex: (index) => set({ workingDayEditIndex: index }),
    setWorkingDayFormData: (data) => set((state) => ({ workingDayFormData: { ...state.workingDayFormData, ...data } })),
    resetWorkingDayFormData: () => set({ workingDayFormData: { working_date: "", day: "" } }),
    setWorkingDayLoading: (loading) => set({ workingDayLoading: loading }),

    setShowWorkingDays: (show) => set({ showWorkingDays: show }),
}));

export default useHolidayStore;

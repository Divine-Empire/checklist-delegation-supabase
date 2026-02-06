import { create } from 'zustand';

const useAssignTaskStore = create((set) => ({
    formData: {
        department: "",
        givenBy: "",
        doer: "",
        description: "",
        frequency: "daily",
        enableReminders: true,
        requireAttachment: false,
    },
    date: null,
    time: "09:00",
    showCalendar: false,
    generatedTasks: [],
    accordionOpen: false,
    isSubmitting: false,
    workingDays: [],

    setFormData: (update) => set((state) => ({
        formData: typeof update === 'function' ? update(state.formData) : { ...state.formData, ...update }
    })),

    setDate: (date) => set({ date }),
    setTime: (time) => set({ time }),
    setShowCalendar: (show) => set({ showCalendar: show }),
    setGeneratedTasks: (tasks) => set({ generatedTasks: tasks }),
    setAccordionOpen: (isOpen) => set({ accordionOpen: isOpen }),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    setWorkingDays: (days) => set({ workingDays: days }),

    resetForm: () => set({
        formData: {
            department: "",
            givenBy: "",
            doer: "",
            description: "",
            frequency: "daily",
            enableReminders: true,
            requireAttachment: false,
        },
        date: null,
        time: "09:00",
        generatedTasks: [],
        accordionOpen: false,
    })
}));

export default useAssignTaskStore;

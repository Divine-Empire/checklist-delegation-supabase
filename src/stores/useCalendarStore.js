import { create } from 'zustand';

const useCalendarStore = create((set) => ({
    // --- Data ---
    events: [],
    dateDataMap: {},
    allWorkingDates: [],
    lastWorkingDate: null,
    availableNames: [],
    loading: true,
    error: null,
    calendarKey: 0,

    // --- Filters ---
    selectedNameFilter: "all",
    stats: {
        total: 0,
        pending: 0,
        completed: 0,
    },

    // --- Modal State ---
    selectedEvent: null,
    showModal: false,
    modalTab: "day", // day, week, month

    // --- Actions ---
    setEvents: (events) => set({ events }),
    setDateDataMap: (map) => set({ dateDataMap: map }),
    setAllWorkingDates: (dates) => set({ allWorkingDates: dates }),
    setLastWorkingDate: (date) => set({ lastWorkingDate: date }),
    setAvailableNames: (names) => set({ availableNames: names }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    incrementCalendarKey: () => set((state) => ({ calendarKey: state.calendarKey + 1 })),

    setSelectedNameFilter: (filter) => set({ selectedNameFilter: filter }),
    setStats: (stats) => set({ stats }),

    setSelectedEvent: (event) => set({ selectedEvent: event }),
    setShowModal: (show) => set({ showModal: show }),
    setModalTab: (tab) => set({ modalTab: tab }),

    // Composite actions
    resetData: () => set({
        events: [],
        dateDataMap: {},
        error: null,
        stats: { total: 0, pending: 0, completed: 0 }
    }),
}));

export default useCalendarStore;

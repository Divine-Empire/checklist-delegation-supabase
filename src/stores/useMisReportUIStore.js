import { create } from 'zustand';

const useMisReportUIStore = create((set) => ({
    staffFilter: "all",
    searchQuery: "",
    setStaffFilter: (filter) => set({ staffFilter: filter }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    resetFilters: () => set({ staffFilter: "all", searchQuery: "" })
}));

export default useMisReportUIStore;

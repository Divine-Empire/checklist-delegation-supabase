import { create } from 'zustand'

export const useDashboardStore = create((set) => ({
    // Active Tab & View State
    activeTab: "overview", // 'overview' | 'list'
    setActiveTab: (tab) => set({ activeTab: tab }),

    taskView: "recent", // 'recent' | 'upcoming' | 'overdue'
    setTaskView: (view) => set({ taskView: view }),

    dashboardType: "checklist", // 'checklist' | 'delegation'
    setDashboardType: (type) => set({
        dashboardType: type,
        // Reset filters when dashboard type changes
        dashboardStaffFilter: "all",
        departmentFilter: "all",
        searchQuery: "",
        currentPage: 1,
        hasMoreData: true,
        dateRange: {
            startDate: "",
            endDate: "",
            filtered: false
        }
    }),

    // Filters
    filterStatus: "all",
    setFilterStatus: (status) => set({ filterStatus: status }),

    filterStaff: "all",
    setFilterStaff: (staff) => set({ filterStaff: staff }),

    dashboardStaffFilter: "all",
    setDashboardStaffFilter: (filter) => set({ dashboardStaffFilter: filter }),

    departmentFilter: "all",
    setDepartmentFilter: (filter) => set({ departmentFilter: filter }),

    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Date Range Filter
    dateRange: {
        startDate: "",
        endDate: "",
        filtered: false,
    },
    setDateRange: (range) => set((state) => ({
        dateRange: { ...state.dateRange, ...range }
    })),
    clearDateRange: () => set({
        dateRange: {
            startDate: "",
            endDate: "",
            filtered: false
        }
    }),

    // Filtered Stats
    filteredDateStats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
    },
    setFilteredDateStats: (stats) => set({ filteredDateStats: stats }),

    // Available Options State
    availableStaff: [],
    setAvailableStaff: (staff) => set({ availableStaff: staff }),

    availableDepartments: [],
    setAvailableDepartments: (depts) => set({ availableDepartments: depts }),

    // Pagination State
    currentPage: 1,
    setCurrentPage: (page) => set({ currentPage: page }),
    incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),

    isLoadingMore: false,
    setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),

    hasMoreData: true,
    setHasMoreData: (hasMore) => set({ hasMoreData: hasMore }),

    resetPagination: () => set({
        currentPage: 1,
        hasMoreData: true,
        isLoadingMore: false
    })
}))

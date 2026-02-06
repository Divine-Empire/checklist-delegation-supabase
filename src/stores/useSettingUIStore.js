import { create } from 'zustand';

const useSettingUIStore = create((set) => ({
    // --- Tabs ---
    activeTab: 'users',
    activeDeptSubTab: 'departments',
    setActiveTab: (tab) => set({ activeTab: tab }),
    setActiveDeptSubTab: (tab) => set({ activeDeptSubTab: tab }),

    // --- Modals & Editing ---
    showUserModal: false,
    showDeptModal: false,
    isEditing: false,
    currentUserId: null,
    currentDeptId: null,

    setShowUserModal: (show) => set({ showUserModal: show }),
    setShowDeptModal: (show) => set({ showDeptModal: show }),
    setIsEditing: (editing) => set({ isEditing: editing }),
    setCurrentUserId: (id) => set({ currentUserId: id }),
    setCurrentDeptId: (id) => set({ currentDeptId: id }),

    // --- Filters ---
    usernameFilter: '',
    usernameDropdownOpen: false,
    setUsernameFilter: (filter) => set({ usernameFilter: filter }),
    setUsernameDropdownOpen: (open) => set({ usernameDropdownOpen: open }),

    // --- Device Log Sync ---
    isRefreshing: false,
    setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),

    // --- Leave Management State ---
    selectedUsers: [],
    leaveStartDate: '',
    leaveEndDate: '',
    remark: '',
    leaveUsernameFilter: '',

    setSelectedUsers: (users) => set({ selectedUsers: users }),
    setLeaveStartDate: (date) => set({ leaveStartDate: date }),
    setLeaveEndDate: (date) => set({ leaveEndDate: date }),
    setRemark: (remark) => set({ remark: remark }),
    setLeaveUsernameFilter: (filter) => set({ leaveUsernameFilter: filter }),

    // --- Forms State ---
    userForm: {
        username: '',
        email: '',
        password: '',
        phone: '',
        employee_id: '',
        role: 'user',
        status: 'active',
        department: ''
    },
    deptForm: {
        name: '',
        givenBy: ''
    },

    setUserForm: (formUpdate) => set((state) => ({ userForm: { ...state.userForm, ...formUpdate } })),
    resetUserForm: () => set({
        userForm: {
            username: '',
            email: '',
            password: '',
            phone: '',
            employee_id: '',
            role: 'user',
            status: 'active',
            department: ''
        },
        isEditing: false,
        currentUserId: null
    }),

    setDeptForm: (formUpdate) => set((state) => ({ deptForm: { ...state.deptForm, ...formUpdate } })),
    resetDeptForm: () => set({
        deptForm: { name: '', givenBy: '' },
        currentDeptId: null
    }),

}));

export default useSettingUIStore;

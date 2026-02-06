import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStaffTasksDataApi, getStaffTasksCountApi, getTotalUsersCountApi } from '../redux/api/dashboardApi';
import useMisReportUIStore from '../stores/useMisReportUIStore';
import { CONFIG } from '../config/misReportConfig';

export const useMisReportData = () => {
    const { staffFilter, searchQuery } = useMisReportUIStore();
    const [staffMembers, setStaffMembers] = useState([]);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [totalStaffCount, setTotalStaffCount] = useState(0);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const userRole = localStorage.getItem("role");
    const username = localStorage.getItem("user-name");

    // filteredStaffMembers calculation
    const filteredStaffMembers = useMemo(() => {
        if (!searchQuery.trim()) return staffMembers;
        const query = searchQuery.toLowerCase().trim();
        return staffMembers.filter(staff =>
            staff.name?.toLowerCase().includes(query) ||
            staff.email?.toLowerCase().includes(query)
        );
    }, [staffMembers, searchQuery]);


    const combineStaffData = (checklistData, delegationData) => {
        const combinedMap = new Map();

        // Process checklist data
        if (checklistData) {
            checklistData.forEach(staff => {
                combinedMap.set(staff.name, {
                    ...staff,
                    checklistTotal: staff.totalTasks || 0,
                    checklistCompleted: staff.completedTasks || 0,
                    checklistPending: staff.pendingTasks || 0,
                    checklistProgress: staff.progress || 0
                });
            });
        }

        // Process delegation data
        if (delegationData) {
            delegationData.forEach(staff => {
                const existing = combinedMap.get(staff.name);
                if (existing) {
                    combinedMap.set(staff.name, {
                        ...existing,
                        delegationTotal: staff.totalTasks || 0,
                        delegationCompleted: staff.completedTasks || 0,
                        delegationPending: staff.pendingTasks || 0,
                        delegationProgress: staff.progress || 0
                    });
                } else {
                    combinedMap.set(staff.name, {
                        ...staff,
                        name: staff.name,
                        email: staff.email,
                        checklistTotal: 0,
                        checklistCompleted: 0,
                        checklistPending: 0,
                        checklistProgress: 0,
                        delegationTotal: staff.totalTasks || 0,
                        delegationCompleted: staff.completedTasks || 0,
                        delegationPending: staff.pendingTasks || 0,
                        delegationProgress: staff.progress || 0
                    });
                }
            });
        }

        return Array.from(combinedMap.values()).map(staff => {
            const totalTasks = (staff.checklistTotal || 0) + (staff.delegationTotal || 0);
            const completed = (staff.checklistCompleted || 0) + (staff.delegationCompleted || 0);
            const pending = (staff.checklistPending || 0) + (staff.delegationPending || 0); // Original code logic
            const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

            return {
                ...staff,
                totalTasks,
                completedTasks: completed,
                pendingTasks: pending,
                progress: progress,
                delegationPending: staff.delegationPending || 0
            };
        });
    };

    const loadStaffData = useCallback(async (page = 1) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            if (page === 1) {
                const [checklistData, delegationData, staffCount, usersCount] = await Promise.all([
                    fetchStaffTasksDataApi("checklist", staffFilter, page, CONFIG.ITEMS_PER_PAGE),
                    fetchStaffTasksDataApi("delegation", staffFilter, page, CONFIG.ITEMS_PER_PAGE),
                    getStaffTasksCountApi("checklist", staffFilter),
                    getTotalUsersCountApi()
                ]);

                setTotalStaffCount(staffCount);
                setTotalUsersCount(usersCount);

                const combined = combineStaffData(checklistData, delegationData);
                setStaffMembers(combined);
                setHasMoreData(combined.length === CONFIG.ITEMS_PER_PAGE);
            } else {
                const [checklistData, delegationData] = await Promise.all([
                    fetchStaffTasksDataApi("checklist", staffFilter, page, CONFIG.ITEMS_PER_PAGE),
                    fetchStaffTasksDataApi("delegation", staffFilter, page, CONFIG.ITEMS_PER_PAGE)
                ]);
                const combined = combineStaffData(checklistData, delegationData);
                if (combined.length === 0) {
                    setHasMoreData(false);
                } else {
                    setStaffMembers(prev => [...prev, ...combined]);
                    setHasMoreData(combined.length === CONFIG.ITEMS_PER_PAGE);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [staffFilter, isLoading]); // Careful with dependency isLoading here, might block if mistakenly true. 
    // Usually 'isLoading' inside useCallback dependency prevents re-creation but we check it inside. 
    // Actually, `isLoading` state dependency inside standard `useCallback` is fine.

    // Reset when filter changes
    useEffect(() => {
        setCurrentPage(1);
        setStaffMembers([]);
        setHasMoreData(true);
        loadStaffData(1);
    }, [staffFilter]);
    // Note: Removed `loadStaffData` from dependency to avoid loop if `loadStaffData` changes. 
    // Since `loadStaffData` depends on `isLoading`, and `isLoading` changes during execution...
    // simpler to put the logic inside useEffect or keep loadStaffData stable.
    // However, `loadStaffData` needs `isLoading` current value? No, closure captures it?
    // useRef for loading is safer if avoiding re-renders. But let's stick to standard patterns.
    // The previous code had `loadStaffData` depending on `dashboardStaffFilter`, and useEffect depending on filter.

    const loadMore = () => {
        if (!isLoading && hasMoreData) {
            const next = currentPage + 1;
            setCurrentPage(next);
            loadStaffData(next);
        }
    };

    // Available Staff
    useEffect(() => {
        const fetchAvailable = async () => {
            const [cd, dd] = await Promise.all([
                fetchStaffTasksDataApi("checklist", "all", 1, 100),
                fetchStaffTasksDataApi("delegation", "all", 1, 100)
            ]);
            const combined = combineStaffData(cd, dd);
            const unique = [...new Set(combined.map(s => s.name).filter(Boolean))];
            if (userRole !== "admin" && username && !unique.some(s => s.toLowerCase() === username.toLowerCase())) {
                unique.push(username);
            }
            setAvailableStaff(unique);
        };
        fetchAvailable();
    }, [userRole, username]);

    return {
        filteredStaffMembers,
        staffMembers,
        availableStaff,
        totalUsersCount,
        hasMoreData,
        isLoading,
        loadMore,
        totalStaffCount
    };
};

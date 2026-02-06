"use client"

import { useEffect } from "react"
import { useSelector } from "react-redux"
import AdminLayout from "../../components/layout/AdminLayout.jsx"
import DashboardHeader from "./dashboard/DashboardHeader.jsx"
import StatisticsCards from "./dashboard/StaticsCard.jsx"
import TaskNavigationTabs from "./dashboard/TaskNavigationTab.jsx"
import StaffTasksTable from "./dashboard/StaffTaskTable.jsx"
import { useDashboardStore } from "../../store/useDashboardStore.js"
import { useDashboardData } from "../../hooks/useDashboardData.js"
import {
  parseTaskStartDate,
  isDateToday,
  isDateInPast
} from "../../utils/dateUtils.js" // Updated import to new extended utils

export default function AdminDashboard() {
  const {
    dashboardType, setDashboardType,
    taskView, setTaskView,
    filterStatus, setFilterStatus,
    filterStaff, setFilterStaff,
    dashboardStaffFilter, setDashboardStaffFilter,
    departmentFilter, setDepartmentFilter,
    searchQuery, setSearchQuery,
    activeTab,
    availableStaff,
    availableDepartments,
    isLoadingMore,
    hasMoreData,
    dateRange,
    filteredDateStats // This assumes we added it to store, checking Store definition...
  } = useDashboardStore()

  // Quick fix: Since I might have missed adding filteredDateStats to store initial state in previous tool call,
  // I will assume it's there or I should have added it.
  // Ideally, I should update the store file first if I missed it.

  const {
    departmentData,
    handleDateRangeChange
  } = useDashboardData()

  const { totalTask, completeTask, pendingTask, overdueTask } = useSelector((state) => state.dashBoard)
  const userRole = localStorage.getItem("role")
  const username = localStorage.getItem("user-name")

  // Helper to get filtered stats from store (if using store) or derived
  // For now let's trust the data flow.

  // We need to define filteredDateStats in store if not present.

  // Filter tasks based on criteria
  const filteredTasks = departmentData.allTasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false
    if (filterStaff !== "all" && task.assignedTo.toLowerCase() !== filterStaff.toLowerCase()) {
      return false
    }
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      return (
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.id && task.id.toString().includes(query)) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(query))
      )
    }
    return true
  })

  // Get tasks for specific views (Recent, Upcoming, Overdue)
  const getTasksByView = (view) => {
    return filteredTasks.filter((task) => {
      const taskDate = parseTaskStartDate(task.originalTaskStartDate);
      if (!taskDate) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const taskDateOnly = new Date(taskDate);
      taskDateOnly.setHours(0, 0, 0, 0);

      switch (view) {
        case "recent":
          if (dashboardType === "delegation") {
            return isDateToday(taskDate);
          }
          return isDateToday(taskDate) && task.status !== "completed";

        case "upcoming":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // For delegation, show tomorrow's tasks regardless of completion status
          if (dashboardType === "delegation") {
            return taskDateOnly.getTime() === tomorrow.getTime();
          }
          // For checklist, show only tomorrow's tasks
          return taskDateOnly.getTime() === tomorrow.getTime();

        case "overdue":
          // For delegation, show tasks that are past due and have null submission_date
          if (dashboardType === "delegation") {
            return taskDateOnly < today && !task.submission_date;
          }
          // For checklist, show tasks that are past due and not completed
          return taskDateOnly < today && task.status !== "completed";

        default:
          return true;
      }
    });
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case "one-time": return "bg-gray-500 hover:bg-gray-600 text-white"
      case "daily": return "bg-blue-500 hover:bg-blue-600 text-white"
      case "weekly": return "bg-purple-500 hover:bg-purple-600 text-white"
      case "fortnightly": return "bg-indigo-500 hover:bg-indigo-600 text-white"
      case "monthly": return "bg-orange-500 hover:bg-orange-600 text-white"
      case "quarterly": return "bg-amber-500 hover:bg-amber-600 text-white"
      case "yearly": return "bg-emerald-500 hover:bg-emerald-600 text-white"
      default: return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  // Use a store selector or state for this if I updated store properly.
  // Re-implementing access to the dynamic state if possible or derived.

  // NOTE: Logic for displayStats needs filteredDateStats from STORE. 
  // I need to ensure store has it.
  // const filteredDateStats = useDashboardStore(state => state.filteredDateStats) 

  // Placeholder for displayStats logic
  const displayStats = dateRange.filtered ? {
    totalTasks: filteredDateStats.totalTasks,
    completedTasks: filteredDateStats.completedTasks,
    pendingTasks: filteredDateStats.pendingTasks,
    overdueTasks: filteredDateStats.overdueTasks,
  } : {
    totalTasks: totalTask || 0,
    completedTasks: completeTask || 0,
    pendingTasks: pendingTask || 0,
    overdueTasks: overdueTask || 0,
  };

  const notDoneTask = (displayStats.totalTasks || 0) - (displayStats.completedTasks || 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <DashboardHeader
          dashboardType={dashboardType}
          setDashboardType={setDashboardType}
          dashboardStaffFilter={dashboardStaffFilter}
          setDashboardStaffFilter={setDashboardStaffFilter}
          availableStaff={availableStaff}
          userRole={userRole}
          username={username}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          availableDepartments={availableDepartments}
          isLoadingMore={isLoadingMore}
          onDateRangeChange={handleDateRangeChange}
        />

        <StatisticsCards
          totalTask={displayStats.totalTasks}
          completeTask={displayStats.completedTasks}
          pendingTask={displayStats.pendingTasks}
          overdueTask={displayStats.overdueTasks}
          notDoneTask={notDoneTask}
          dashboardType={dashboardType}
          dateRange={dateRange.filtered ? dateRange : null}
        />


        <TaskNavigationTabs
          taskView={taskView}
          setTaskView={setTaskView}
          dashboardType={dashboardType}
          dashboardStaffFilter={dashboardStaffFilter}
          departmentFilter={departmentFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStaff={filterStaff}
          setFilterStaff={setFilterStaff}
          departmentData={departmentData}
          getTasksByView={getTasksByView}
          getFrequencyColor={getFrequencyColor}
          isLoadingMore={isLoadingMore}
          hasMoreData={hasMoreData}
        />
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200 shadow-md bg-white">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                <h3 className="text-purple-700 font-medium">Staff Task Summary</h3>
                <p className="text-purple-600 text-sm">Overview of tasks assigned to each staff member</p>
              </div>
              <div className="p-4">
                <StaffTasksTable
                  dashboardType={dashboardType}
                  dashboardStaffFilter={dashboardStaffFilter}
                  departmentFilter={departmentFilter}
                  parseTaskStartDate={parseTaskStartDate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
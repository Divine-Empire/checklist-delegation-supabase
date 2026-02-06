"use client";
import React from "react";
import {
  CheckCircle2,
  X,
  Search,
  Edit,
  Save,
  XCircle,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import useApprovalStore from "../../store/useApprovalStore";
import { useApprovalData } from "../../hooks/useApprovalData";

// Configuration object
const CONFIG = {
  PAGE_CONFIG: {
    historyTitle: "Approval Pending Tasks",
    description: "Showing today, tomorrow's tasks and past due tasks",
    historyDescription:
      "Read-only view of completed tasks with submission history (excluding admin-processed items)",
  },
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, itemCount, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-100 text-yellow-600 rounded-full p-3 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Mark Items as Admin Done
          </h2>
        </div>

        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to mark {itemCount}{" "}
          {itemCount === 1 ? "item" : "items"} as Admin Done?
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

function Approval() {
  const {
    activeApprovalTab,
    setActiveApprovalTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    successMessage,
    setSuccessMessage,
    memberSearchTerm,
    setMemberSearchTerm,
    showMemberDropdown,
    setShowMemberDropdown,
    selectedMembers,
    handleMemberSelection,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedHistoryItems,
    setSelectedHistoryItems,
    editingRows,
    editedAdminStatus,
    setEditedAdminStatus,
    confirmationModal,
    setConfirmationModal,
    markingAsDone,
    resetFilters
  } = useApprovalStore();

  const {
    filteredHistoryData,
    filteredDelegationHistoryData,
    getFilteredMembersList,
    userRole,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
    handleMarkMultipleDone,
    confirmMarkDone
  } = useApprovalData();

  const isAdmin = userRole === "admin";
  const currentData = activeApprovalTab === 'checklist' ? filteredHistoryData : filteredDelegationHistoryData;

  const getTaskStatistics = () => {
    const memberStats = selectedMembers.length > 0
      ? selectedMembers.reduce((stats, member) => {
        const memberTasks = currentData.filter(
          (task) => task.name === member
        ).length;
        return {
          ...stats,
          [member]: memberTasks,
        };
      }, {})
      : {};

    return {
      totalCompleted: currentData.length,
      filteredTotal: currentData.length,
      memberStats
    }
  };

  const isEmpty = (value) => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    );
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-purple-700 text-center sm:text-left">
              {CONFIG.PAGE_CONFIG.historyTitle}
            </h1>

            {/* Tab Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setActiveApprovalTab('checklist')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeApprovalTab === 'checklist'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Checklist Tasks
              </button>
              <button
                onClick={() => setActiveApprovalTab('delegation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeApprovalTab === 'delegation'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Delegation Tasks
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-green-500 hover:text-green-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">


            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-purple-600">Loading task data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
                {error}{" "}
                <button
                  className="underline ml-2"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                {/* History Filters */}
                <div className="p-4 border-b border-purple-100 bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {getFilteredMembersList().length > 0 && userRole === "admin" && (
                      <div className="flex flex-col">
                        <div className="mb-2 flex items-center">
                          <span className="text-sm font-medium text-purple-700">
                            Filter by Member:
                          </span>
                        </div>
                        <div className="relative min-w-[250px]">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search members..."
                              value={memberSearchTerm}
                              onChange={(e) =>
                                setMemberSearchTerm(e.target.value)
                              }
                              onFocus={() => setShowMemberDropdown(true)}
                              className="w-full p-2 pr-8 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Search
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                          </div>

                          {showMemberDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {getFilteredMembersList()
                                .filter((member) =>
                                  member
                                    .toLowerCase()
                                    .includes(memberSearchTerm.toLowerCase())
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center px-3 py-2 hover:bg-purple-50 cursor-pointer"
                                    onClick={() => handleMemberSelection(member)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedMembers.includes(member)}
                                      onChange={() => { }}
                                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 pointer-events-none"
                                    />
                                    <label className="ml-2 text-sm text-gray-700 cursor-pointer flex-1">
                                      {member}
                                    </label>
                                  </div>
                                ))}
                              {getFilteredMembersList().filter((member) =>
                                member
                                  .toLowerCase()
                                  .includes(memberSearchTerm.toLowerCase())
                              ).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    No members found
                                  </div>
                                )}
                            </div>
                          )}

                          {selectedMembers.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedMembers.map((member, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs"
                                >
                                  {member}
                                  <button
                                    onClick={() => handleMemberSelection(member)}
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="mb-2 flex items-center">
                        <span className="text-sm font-medium text-purple-700">
                          Filter by Date Range:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <label
                            htmlFor="start-date"
                            className="text-sm text-gray-700 mr-1"
                          >
                            From
                          </label>
                          <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm border border-gray-200 rounded-md p-1"
                          />
                        </div>
                        <div className="flex items-center">
                          <label
                            htmlFor="end-date"
                            className="text-sm text-gray-700 mr-1"
                          >
                            To
                          </label>
                          <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm border border-gray-200 rounded-md p-1"
                          />
                        </div>
                      </div>
                    </div>
                    {(selectedMembers.length > 0 ||
                      startDate ||
                      endDate ||
                      searchTerm) && (
                        <button
                          onClick={resetFilters}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                        >
                          Clear All Filters
                        </button>
                      )}
                  </div>
                </div>

                {/* NEW: Confirmation Modal */}
                <ConfirmationModal
                  isOpen={confirmationModal.isOpen}
                  itemCount={confirmationModal.itemCount}
                  onConfirm={confirmMarkDone}
                  onCancel={() =>
                    setConfirmationModal({ isOpen: false, itemCount: 0 })
                  }
                />

                {/* Task Statistics */}
                <div className="p-4 border-b border-purple-100 bg-blue-50">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">
                      Task Completion Statistics:
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="px-3 py-2 bg-white rounded-md shadow-sm">
                        <span className="text-xs text-gray-500">
                          Total Completed
                        </span>
                        <div className="text-lg font-semibold text-blue-600">
                          {getTaskStatistics().totalCompleted}
                        </div>
                      </div>
                      {(selectedMembers.length > 0 ||
                        startDate ||
                        endDate ||
                        searchTerm) && (
                          <div className="px-3 py-2 bg-white rounded-md shadow-sm">
                            <span className="text-xs text-gray-500">
                              Filtered Results
                            </span>
                            <div className="text-lg font-semibold text-blue-600">
                              {getTaskStatistics().filteredTotal}
                            </div>
                          </div>
                        )}
                      {selectedMembers.map((member) => (
                        <div
                          key={member}
                          className="px-3 py-2 bg-white rounded-md shadow-sm"
                        >
                          <span className="text-xs text-gray-500">{member}</span>
                          <div className="text-lg font-semibold text-indigo-600">
                            {getTaskStatistics().memberStats[member]}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Add Mark as Done Button when items are selected */}
                    {userRole === "admin" && selectedHistoryItems.length > 0 && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleMarkMultipleDone}
                          disabled={markingAsDone}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm flex items-center disabled:opacity-50"
                        >
                          {markingAsDone ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark {selectedHistoryItems.length} Items as Done
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* History Table - Based on Active Tab */}
                <div className="hidden sm:block h-[calc(100vh-300px)] overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {/* Admin Done Column - NOW FIRST */}
                        {userRole === "admin" && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 min-w-[120px]">
                            Admin Done
                          </th>
                        )}

                        {/* Admin Select Column Header - Action Column */}
                        {userRole === "admin" && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            <div className="flex flex-col items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                checked={
                                  currentData.filter(
                                    (item) => {
                                      return isEmpty(item.admin_done) ||
                                        (item.admin_done.toString().trim() !== "Done" &&
                                          item.admin_done.toString().trim() !== "Not Done");
                                    }
                                  ).length > 0 &&
                                  selectedHistoryItems.length ===
                                  currentData.filter(
                                    (item) => {
                                      return isEmpty(item.admin_done) ||
                                        (item.admin_done.toString().trim() !== "Done" &&
                                          item.admin_done.toString().trim() !== "Not Done");
                                    }
                                  ).length
                                }
                                onChange={(e) => {
                                  const unprocessedItems = currentData.filter((item) => {
                                    return isEmpty(item.admin_done) ||
                                      (item.admin_done.toString().trim() !== "Done" &&
                                        item.admin_done.toString().trim() !== "Not Done");
                                  });
                                  if (e.target.checked) {
                                    setSelectedHistoryItems(unprocessedItems);
                                  } else {
                                    setSelectedHistoryItems([]);
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-400 mt-1 uppercase font-medium">Admin</span>
                            </div>
                          </th>
                        )}

                        {/* SUB CATEGORY column (Renamed from Department) */}
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                          Sub Category
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                          Task Description
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50 min-w-[140px]">
                          Task End Date & Time
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                          frequency
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                          Require Attachment
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 min-w-[140px]">
                          Actual Date & Time
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[80px]">
                          Status
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50 min-w-[150px]">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={
                              (userRole === "admin" ? 2 : 0) + // Admin Done + Admin checkbox columns
                              (userRole !== "admin" ? 1 : 0) + // Task ID column
                              (userRole !== "admin" && isAdmin ? 3 : 0) + // Department, Given By, Name columns
                              7 + // Fixed columns (Task Description, End Date, frequency, Require Attachment, Actual Date, Status, Remarks, Attachment)
                              (userRole !== "admin" && isAdmin ? 1 : 0) // Enable Reminders column
                            }
                            className="px-6 py-8 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                              <p className="text-purple-600">Loading task data...</p>
                            </div>
                          </td>
                        </tr>
                      ) : currentData.length > 0 ? (
                        currentData.map((history) => {
                          const isInEditMode = editingRows.has(history._id);
                          const isSaving = savingEdits.has(history._id);

                          return (
                            <tr key={history._id} className="hover:bg-gray-50">
                              {/* FIRST: Admin Done Column */}
                              {userRole === "admin" && (
                                <td className="px-3 py-4 bg-gray-50 min-w-[120px]">
                                  {isInEditMode ? (
                                    <div className="flex items-center space-x-2">
                                      <select
                                        value={editedAdminStatus[history._id] || "Not Done"}
                                        onChange={(e) =>
                                          setEditedAdminStatus((prev) => ({
                                            ...prev,
                                            [history._id]: e.target.value,
                                          }))
                                        }
                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSaving}
                                      >
                                        <option value="Not Done">Not Done</option>
                                        <option value="Done">Done</option>
                                      </select>
                                      <div className="flex space-x-1">
                                        <button
                                          onClick={() => handleSaveEdit(history)}
                                          disabled={isSaving}
                                          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                                          title="Save changes"
                                        >
                                          {isSaving ? (
                                            <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                                          ) : (
                                            <Save className="h-4 w-4" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleCancelEdit(history._id)}
                                          disabled={isSaving}
                                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                          title="Cancel editing"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div>
                                        {!isEmpty(history.admin_done) &&
                                          history.admin_done.toString().trim() === "Done" ? (
                                          <div className="flex items-center">
                                            <div className="h-4 w-4 rounded border-gray-300 text-green-600 bg-green-100 mr-2 flex items-center justify-center">
                                              <span className="text-xs text-green-600">✓</span>
                                            </div>
                                            <div className="flex flex-col">
                                              <div className="font-medium text-green-700 text-sm">Done</div>
                                            </div>
                                          </div>
                                        ) : !isEmpty(history.admin_done) &&
                                          history.admin_done.toString().trim() === "Not Done" ? (
                                          <div className="flex items-center text-red-500 text-sm">
                                            <div className="h-4 w-4 rounded border-gray-300 bg-red-100 mr-2 flex items-center justify-center">
                                              <span className="text-xs text-red-600">✗</span>
                                            </div>
                                            <span className="font-medium">Not Done</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center text-gray-400 text-sm">
                                            <div className="h-4 w-4 rounded border-gray-300 mr-2"></div>
                                            <span>Pending</span>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleEditClick(history)}
                                        className="p-1 text-blue-600 hover:text-blue-800 ml-2"
                                        title="Edit admin status"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              )}

                              {/* SECOND: Admin Select Checkbox - Action Column */}
                              {userRole === "admin" && (
                                <td className="px-3 py-4 w-24">
                                  {!isEmpty(history.admin_done) &&
                                    (history.admin_done.toString().trim() === "Done" ||
                                      history.admin_done.toString().trim() === "Not Done") ? (
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`h-4 w-4 rounded border-gray-300 ${history.admin_done.toString().trim() === "Done"
                                          ? "text-green-600 bg-green-100"
                                          : "text-red-600 bg-red-100"
                                          }`}
                                      >
                                        <span
                                          className={`text-xs ${history.admin_done.toString().trim() === "Done"
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                        >
                                          {history.admin_done.toString().trim() === "Done" ? "✓" : "✗"}
                                        </span>
                                      </div>
                                      <span
                                        className={`text-xs mt-1 text-center font-medium ${history.admin_done.toString().trim() === "Done"
                                          ? "text-green-600"
                                          : "text-red-600"
                                          }`}
                                      >
                                        {history.admin_done.toString().trim()}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        checked={selectedHistoryItems.some(item => item._id === history._id)}
                                        onChange={() => {
                                          setSelectedHistoryItems(prev =>
                                            prev.some(item => item._id === history._id)
                                              ? prev.filter(item => item._id !== history._id)
                                              : [...prev, history]
                                          );
                                        }}
                                      />
                                      <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold text-center leading-tight">
                                        Mark<br />Done
                                      </span>
                                    </div>
                                  )}
                                </td>
                              )}

                              {/* SUB CATEGORY column */}
                              <td className="px-3 py-4 min-w-[120px]">
                                <div className="text-sm text-gray-900 break-words font-medium">
                                  {history.department || "—"}
                                </div>
                              </td>

                              <td className="px-3 py-4 min-w-[200px]">
                                <div className="text-sm text-gray-900 break-words" title={history.task_description}>
                                  {history.task_description || "—"}
                                </div>
                              </td>

                              <td className="px-3 py-4 bg-yellow-50 min-w-[140px]">
                                <div className="text-sm text-gray-900 break-words">
                                  {history.task_start_date ? (
                                    <div>
                                      <div className="font-medium break-words text-gray-800">
                                        {history.task_start_date.includes(" ") ? history.task_start_date.split(" ")[0] : history.task_start_date}
                                      </div>
                                      {history.task_start_date.includes(" ") && (
                                        <div className="text-xs text-gray-500 break-words">
                                          {history.task_start_date.split(" ")[1]}
                                        </div>
                                      )}
                                    </div>
                                  ) : "—"}
                                </div>
                              </td>

                              <td className="px-3 py-4 min-w-[80px]">
                                <div className="text-sm text-gray-900 break-words">
                                  {history.frequency || "—"}
                                </div>
                              </td>

                              <td className="px-3 py-4 min-w-[120px]">
                                <div className="text-sm text-gray-900 break-words">
                                  {history.require_attachment || "—"}
                                </div>
                              </td>

                              <td className="px-3 py-4 bg-green-50 min-w-[140px]">
                                <div className="text-sm text-gray-900 break-words">
                                  {history.submission_date ? (
                                    <div>
                                      <div className="font-medium break-words text-gray-800">
                                        {history.submission_date.includes(" ") ? history.submission_date.split(" ")[0] : history.submission_date}
                                      </div>
                                      {history.submission_date.includes(" ") && (
                                        <div className="text-xs text-gray-500 break-words">
                                          {history.submission_date.split(" ")[1]}
                                        </div>
                                      )}
                                    </div>
                                  ) : "—"}
                                </div>
                              </td>

                              <td className="px-3 py-4 bg-blue-50 min-w-[80px]">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full break-words ${history.status === "Yes"
                                    ? "bg-green-100 text-green-800"
                                    : history.status === "No"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {history.status || "—"}
                                </span>
                              </td>

                              <td className="px-3 py-4 bg-purple-50 min-w-[150px]">
                                <div className="text-sm text-gray-900 break-words" title={history.remark}>
                                  {history.remark || "—"}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={
                              (userRole === "admin" ? 2 : 0) + // Admin Done + Admin checkbox columns
                              1 + // Task ID column (now visible for all)
                              (isAdmin ? 3 : 0) + // Name, Department, Given By columns
                              7 + // Fixed columns (Task Description, Planned Date, Actual Date, Status, frequency, Require Attachment, Remarks)
                              (isAdmin ? 1 : 0) // Enable Reminders column
                            }
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            {searchTerm || selectedMembers.length > 0 || startDate || endDate
                              ? "No historical records matching your filters"
                              : `No completed ${activeApprovalTab} records found`}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4 p-4 max-h-[calc(100vh-300px)] overflow-auto">
                  {currentData.length > 0 ? (
                    currentData.map((history) => {
                      const isInEditMode = editingRows.has(history._id);
                      const isSaving = savingEdits.has(history._id);

                      return (
                        <div
                          key={history._id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          {/* Mobile card content - replicate your table row data here */}
                          <div className="space-y-3">
                            {userRole === "admin" && (
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-700">Admin Done Status:</span>
                                {isInEditMode ? (
                                  <div className="flex items-center space-x-2">
                                    <select
                                      value={editedAdminStatus[history._id] || "Not Done"}
                                      onChange={(e) =>
                                        setEditedAdminStatus((prev) => ({
                                          ...prev,
                                          [history._id]: e.target.value,
                                        }))
                                      }
                                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      disabled={isSaving}
                                    >
                                      <option value="Not Done">Not Done</option>
                                      <option value="Done">Done</option>
                                    </select>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleSaveEdit(history)}
                                        disabled={isSaving}
                                        className="p-1 text-green-600 hover:text-green-800"
                                      >
                                        <Save className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleCancelEdit(history._id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    {!isEmpty(history.admin_done) && history.admin_done.toString().trim() === "Done" ? (
                                      <span className="text-green-600 text-sm font-medium">Done</span>
                                    ) : (
                                      <span className="text-red-600 text-sm font-medium">Pending</span>
                                    )}
                                    <button
                                      onClick={() => handleEditClick(history)}
                                      className="p-1 text-blue-600 hover:text-blue-800 ml-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {userRole === "admin" && (
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-700">Action:</span>
                                <div className="flex flex-col items-center">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-green-600"
                                    checked={selectedHistoryItems.some(item => item._id === history._id)}
                                    onChange={() => {
                                      setSelectedHistoryItems(prev =>
                                        prev.some(item => item._id === history._id)
                                          ? prev.filter(item => item._id !== history._id)
                                          : [...prev, history]
                                      );
                                    }}
                                  />
                                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">Mark Done</span>
                                </div>
                              </div>
                            )}

                            <div>
                              <span className="font-medium text-gray-700">Sub Category:</span>
                              <p className="mt-1 text-gray-900">{history.department || "—"}</p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">Task:</span>
                              <p className="mt-1 text-gray-900">{history.task_description || "—"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-700">End Date:</span>
                                <p className="text-sm text-gray-900">{history.planned_date || "—"}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Actual Date:</span>
                                <p className="text-sm text-gray-900">{history.submission_date || "—"}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <p className="text-sm text-gray-900">{history.status || "—"}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">frequency:</span>
                                <p className="text-sm text-gray-900">{history.frequency || "—"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      {searchTerm ||
                        selectedMembers.length > 0 ||
                        startDate ||
                        endDate
                        ? "No historical records matching your filters"
                        : "No completed records found"}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Approval;
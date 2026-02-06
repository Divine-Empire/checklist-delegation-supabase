"use client"

import React, { useState } from "react"
import { Upload } from "lucide-react"
import { useSheetData } from "../../hooks/useSheetData"
import DataPageLayout from "../../components/admin/DataPageLayout"
import DataTable from "../../components/admin/DataTable"

// Configuration
const CONFIG = {
  SHEET_NAME: "RKL",
  DRIVE_FOLDER_ID: "1BTXTHd-Mi58N0w1YRci-2Ow2V9GqsNww",
  PAGE_CONFIG: {
    title: "RKL Tasks",
    historyTitle: "RKL Task History",
    description: "Showing today, tomorrow's tasks and past due tasks",
    historyDescription: "Read-only view of completed tasks with submission history"
  }
}

// Column Definition Helper
const createColumns = (isHistory) => [
  { label: "Timestamp", key: "col0" },
  { label: "Task ID", key: "col1" },
  { label: "Firm", key: "col2" },
  { label: "Given By", key: "col3" },
  { label: "Name", key: "col4" },
  { label: "Task Description", key: "col5" },
  { label: "Task Start Date", key: "col6" }, // Date
  { label: "Freq", key: "col7" },
  { label: "Enable Reminders", key: "col8" },
  { label: "Require Attachment", key: "col9" },
  { label: "Actual", key: "col10" }, // Date
  { label: "Column L", key: "col11" },
  { label: "Status", key: "col12" }, // Status Column
  { label: "Remarks", key: "col13" },
  {
    label: "Uploaded Image",
    key: "col14",
    render: (item) => item.col14 && String(item.col14).startsWith("http") ? (
      <a href={item.col14} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
    ) : item.col14
  },
  { label: "Admin Done", key: "col15" },
  // Action Column for Pending View (Inputs)
  ...(!isHistory ? [{
    label: "Actions",
    key: "actions",
    render: (item, { isSelected, additionalData, setAdditionalData, remarksData, setRemarksData, handleImageUpload }) => {
      if (!isSelected) return null

      return (
        <div className="space-y-2 min-w-[200px]">
          {/* Status Select */}
          <select
            value={additionalData[item._id] || ""}
            onChange={(e) => setAdditionalData(prev => ({ ...prev, [item._id]: e.target.value }))}
            className="w-full text-xs p-1 border rounded"
          >
            <option value="">Select Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          {/* Remarks Input if No */}
          {additionalData[item._id] === "No" && (
            <input
              type="text"
              placeholder="Reason for No..."
              value={remarksData[item._id] || ""}
              onChange={(e) => setRemarksData(prev => ({ ...prev, [item._id]: e.target.value }))}
              className="w-full text-xs p-1 border rounded"
            />
          )}

          {/* File Upload if Required */}
          {/* Check column req at index 9 (col9) */}
          {item.col9 && item.col9.toUpperCase() === "YES" && (
            <div className="flex items-center gap-1">
              <label className="cursor-pointer text-xs bg-gray-100 p-1 rounded flex items-center">
                <Upload size={12} className="mr-1" />
                {item._newImage ? "Image Selected" : "Upload"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleImageUpload(item._id, e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>
      )
    }
  }] : [])
]

export default function AccountDataPage() {
  const {
    data,
    loading,
    error,
    filters,
    selection,
    actions,
    // Meta
    rawHistoryData
  } = useSheetData({
    sheetName: CONFIG.SHEET_NAME,
    driveFolderId: CONFIG.DRIVE_FOLDER_ID
  })

  // Derive title based on view
  const currentTitle = filters.showHistory ? CONFIG.PAGE_CONFIG.historyTitle : CONFIG.PAGE_CONFIG.title
  const currentDesc = filters.showHistory ? CONFIG.PAGE_CONFIG.historyDescription : CONFIG.PAGE_CONFIG.description

  const [submitLoading, setSubmitLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const handleSubmit = async () => {
    setSubmitLoading(true)
    const res = await actions.submitItems()
    setSubmitLoading(false)
    if (res.success) {
      setSuccessMsg("Submitted successfully!")
    } else {
      alert("Error: " + res.message)
    }
  }

  // Admin Bulk Done Logic (Pending Items)
  // This was custom in the original file, we can implement it here using actions.submitItems 
  // with a forced payload if needed, but generic hook handles submission logic. 
  // The generic hook submits "status", "remarks", "imageUrl".
  // The "Admin Done" button in original file updated Column P to "Done".
  // Our generic hook updates based on "additionalInfo" (status) and "remarks".
  // If we need SPECIAL admin done logic, we might need to extend the hook or handle it here customized.
  // Original `handleMarkMultiplePendingDone` updated `adminDoneStatus` to "Done".

  // For now, let's stick to the main submission flow which was the primary user interaction.
  // The "Admin Done" feature can be added to the generic hook if widespread.

  return (
    <DataPageLayout
      title={currentTitle}
      description={currentDesc}
      showHistory={filters.showHistory}
      onToggleHistory={() => filters.setShowHistory(!filters.showHistory)}
      searchTerm={filters.searchTerm}
      onSearchChange={filters.setSearchTerm}
      error={error}
      successMessage={successMsg}
      onClearSuccess={() => setSuccessMsg("")}
      actions={
        !filters.showHistory && (
          <button
            onClick={handleSubmit}
            disabled={selection.selectedItems.size === 0 || submitLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {submitLoading ? "Submitting..." : `Submit (${selection.selectedItems.size})`}
          </button>
        )
      }
    >
      {/* Filters (Member Checkboxes) */}
      <div className="p-4 bg-gray-50 border-b">
        <details>
          <summary className="cursor-pointer font-medium text-sm text-purple-700">Filter Members ({filters.membersList.length})</summary>
          <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {filters.membersList.map((m, i) => (
              <label key={i} className="flex items-center space-x-1 text-xs bg-white p-1 rounded border">
                <input
                  type="checkbox"
                  checked={filters.selectedMembers.includes(m)}
                  onChange={(e) => {
                    if (e.target.checked) filters.setSelectedMembers(p => [...p, m])
                    else filters.setSelectedMembers(p => p.filter(x => x !== m))
                  }}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      <DataTable
        data={data}
        loading={loading}
        columns={createColumns(filters.showHistory)}
        selection={selection}
        showHistory={filters.showHistory}
      />
    </DataPageLayout>
  )
}
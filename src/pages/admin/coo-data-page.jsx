"use client"

import React, { useState } from "react"
import { Upload, CheckCircle } from "lucide-react"
import { useSheetData } from "../../hooks/useSheetData"
import DataPageLayout from "../../components/admin/DataPageLayout"
import DataTable from "../../components/admin/DataTable"

const CONFIG = {
  SHEET_NAME: "COO",
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycby0-aE9uNuU3yBJ9SAHvAfXycYt5vPyvAtlAauVy-xlH9rc4fPCGSQM6pvsqZ9QvSvbyg/exec",
  DRIVE_FOLDER_ID: "1TzjAIpRAoz017MfzZ0gZaN-v5jyKtg7E",
  PAGE_CONFIG: {
    title: "COO Data",
    historyTitle: "COO Data History",
    description: "Showing today and tomorrow's records with pending submissions",
    historyDescription: "Showing all completed records with submission dates"
  }
}

const createColumns = (isHistory) => [
  { label: "Timestamp", key: "col0" },
  { label: "ID", key: "col1" },
  { label: "Item", key: "col2" },
  { label: "Category", key: "col3" },
  { label: "Given By", key: "col4" }, // Member
  { label: "Description", key: "col5" },
  { label: "Quantity", key: "col6" },
  { label: "Date", key: "col7" },
  { label: "Status", key: "col8" },
  { label: "Ref", key: "col9" },

  // Column 10 (K) - Attachment Required?
  { label: "Attachment Req", key: "col10" },

  // Columns L(11), M(12) are dates usually (Pending/Actual)
  { label: "Pending Date", key: "col11" },
  { label: "Submission Date", key: "col12" },

  // Column 13, 14 fillers?
  { label: "Remarks", key: "col13" },
  {
    label: "Image",
    key: "col14", // Column O? Logic might vary, let's assume standard index or adjust if needed.
    // In original code, Image URL was Column P (index 15) sometimes? 
    // Actually standard hook maps generic cols. 
    render: (item) => {
      // Check known image columns/properties
      const url = item.imageUrl || item.col15 || item.col14
      if (url && String(url).startsWith("http")) {
        return <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
      }
      return ""
    }
  },

  { label: "Admin Done", key: "col15" },
  { label: "Final Status", key: "col16" }, // Column Q

  ...(!isHistory ? [{
    label: "Actions",
    key: "actions",
    render: (item, { isSelected, additionalData, setAdditionalData, remarksData, setRemarksData, handleImageUpload }) => {
      if (!isSelected) return null
      return (
        <div className="space-y-2 min-w-[200px]">
          <select
            value={additionalData[item._id] || ""}
            onChange={(e) => setAdditionalData(prev => ({ ...prev, [item._id]: e.target.value }))}
            className="w-full text-xs p-1 border rounded"
          >
            <option value="">Select Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          {additionalData[item._id] === "No" && (
            <input
              type="text"
              placeholder="Remarks..."
              value={remarksData[item._id] || ""}
              onChange={(e) => setRemarksData(prev => ({ ...prev, [item._id]: e.target.value }))}
              className="w-full text-xs p-1 border rounded"
            />
          )}

          {/* Attachment Required Check */}
          {item.col10 && String(item.col10).toUpperCase() === "YES" && (
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

export default function CooDataPage() {
  const {
    data,
    loading,
    error,
    filters,
    selection,
    actions,
    rawHistoryData
  } = useSheetData({
    sheetName: CONFIG.SHEET_NAME,
    scriptUrl: CONFIG.SCRIPT_URL,
    driveFolderId: CONFIG.DRIVE_FOLDER_ID
  })

  // Title Logic
  const currentTitle = filters.showHistory ? CONFIG.PAGE_CONFIG.historyTitle : CONFIG.PAGE_CONFIG.title
  const currentDesc = filters.showHistory ? CONFIG.PAGE_CONFIG.historyDescription : CONFIG.PAGE_CONFIG.description

  const [localLoading, setLocalLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  // Standard Submit (Pending -> History)
  const handleSubmit = async () => {
    setLocalLoading(true)
    const res = await actions.submitItems()
    setLocalLoading(false)
    if (res.success) setSuccessMsg("Submitted successfully!")
    else alert("Error: " + res.message)
  }

  // Custom "Mark as Done" (History -> Final)
  const handleMarkAsDone = async () => {
    if (selection.selectedItems.size === 0) return
    if (!window.confirm(`Mark ${selection.selectedItems.size} items as DONE?`)) return

    setLocalLoading(true)
    try {
      // Prepare payload manually for this specific action
      const itemsToUpdate = rawHistoryData.filter(i => selection.selectedItems.has(i._id))

      const submissionData = itemsToUpdate.map(item => ({
        taskId: item.task_id || item.col1, // Fallback to col1 (ID)
        rowIndex: item._rowIndex,
        additionalInfo: "",
        imageData: null,
        imageUrl: "",
        todayDate: "",
        doneStatus: "DONE" // Specific for Column Q
      }))

      const formData = new FormData()
      formData.append('sheetName', CONFIG.SHEET_NAME)
      formData.append('action', 'updateSalesData')
      formData.append('rowData', JSON.stringify(submissionData))

      const res = await fetch(CONFIG.SCRIPT_URL, { method: 'POST', body: formData })
      const json = await res.json()

      if (json.success) {
        setSuccessMsg(`Marked ${itemsToUpdate.length} items as done!`)
        selection.selectAll(false) // Deselect
        setTimeout(actions.fetchData, 1500) // Refresh
      } else {
        throw new Error(json.error)
      }

    } catch (err) {
      console.error(err)
      alert("Failed: " + err.message)
    } finally {
      setLocalLoading(false)
    }
  }

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
        !filters.showHistory ? (
          <button
            onClick={handleSubmit}
            disabled={selection.selectedItems.size === 0 || localLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {localLoading ? "Processing..." : `Submit (${selection.selectedItems.size})`}
          </button>
        ) : (
          // History Action: Mark as Done
          <button
            onClick={handleMarkAsDone}
            disabled={selection.selectedItems.size === 0 || localLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <CheckCircle size={16} className="mr-1" />
            {localLoading ? "Processing..." : `Mark Done (${selection.selectedItems.size})`}
          </button>
        )
      }
    >
      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b">
        <details>
          <summary className="cursor-pointer font-medium text-sm text-purple-700">Filter Members</summary>
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
        // Enable selection in history for this page only
        showSelection={true}
      />
    </DataPageLayout>
  )
}
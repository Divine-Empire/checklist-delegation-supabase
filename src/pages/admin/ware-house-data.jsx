"use client"

import DataPageLayout from "../../components/admin/DataPageLayout"

// Configuration for Warehouse Data Page (REFRASYNTH Sheet)
const CONFIG = {
  // Google Apps Script URL
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby0-aE9uNuU3yBJ9SAHvAfXycYt5vPyvAtlAauVy-xlH9rc4fPCGSQM6pvsqZ9QvSvbyg/exec",

  // Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: "1P6jC4X8eMoyPUOUCFp8G30I83aAeEIy9",

  // Sheet name to work with
  SHEET_NAME: "REFRASYNTH",

  // Page configuration
  PAGE_CONFIG: {
    title: "REFRASYNTH Tasks",
    historyTitle: "REFRASYNTH Task History",
    description: "Showing today, tomorrow's tasks and past due tasks",
    historyDescription: "Read-only view of completed tasks with submission history"
  }
}

export default function WarehouseDataPage() {
  return (
    <DataPageLayout config={CONFIG} />
  )
}
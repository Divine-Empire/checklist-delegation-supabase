"use client"

import DataPageLayout from "../../components/admin/DataPageLayout"

// Configuration for Managing Director Page (PURAB Sheet)
const CONFIG = {
  // Google Apps Script URL
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz47q4SiLvJJom8dRGteqjhufs0Iui4rYTLMeTYqOgY_MFrS0C0o0XkRCPzAOdEeg4jqg/exec",

  // Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: "1IENpXhLEgB7lI8VAMc0qPIqtQgBcPDcM",

  // Sheet name to work with
  SHEET_NAME: "PURAB",

  // Page configuration
  PAGE_CONFIG: {
    title: "PURAB Tasks",
    historyTitle: "PURAB Task History",
    description: "Showing today, tomorrow's tasks and past due tasks",
    historyDescription: "Read-only view of completed tasks with submission history"
  }
}

export default function ManagingDirectorDataPage() {
  return (
    <DataPageLayout config={CONFIG} />
  )
}
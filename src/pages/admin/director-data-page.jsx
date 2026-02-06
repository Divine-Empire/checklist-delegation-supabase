"use client"

import DataPageLayout from "../../components/admin/DataPageLayout"

// Configuration for Director Data Page (HR Sheet)
const CONFIG = {
  // Google Apps Script URL
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz47q4SiLvJJom8dRGteqjhufs0Iui4rYTLMeTYqOgY_MFrS0C0o0XkRCPzAOdEeg4jqg/exec",

  // Google Drive folder ID for file uploads 
  // Configured for HR sheet uploads
  DRIVE_FOLDER_ID: "1xdahLZtnhCGnHve4HdPolTm5y4DLqdyl",

  // Sheet name to work with
  SHEET_NAME: "HR",

  // Page configuration
  PAGE_CONFIG: {
    title: "HR Data",
    historyTitle: "HR Data History",
    description: "Showing today and tomorrow's records with pending submissions",
    historyDescription: "Showing all completed records with submission dates"
  }
}

export default function DirectorDataPage() {
  return (
    <DataPageLayout config={CONFIG} />
  )
}
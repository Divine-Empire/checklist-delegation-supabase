"use client"

import DataPageLayout from "../../components/admin/DataPageLayout"

// Configuration for Jockey Data Page
const CONFIG = {
  // Google Apps Script URL
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz47q4SiLvJJom8dRGteqjhufs0Iui4rYTLMeTYqOgY_MFrS0C0o0XkRCPzAOdEeg4jqg/exec",

  // Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: "1TzjAIpRAoz017MfzZ0gZaN-v5jyKtg7E",

  // Sheet name to work with
  SHEET_NAME: "JOCKEY",

  // Page configuration
  PAGE_CONFIG: {
    title: "Jockey Data",
    historyTitle: "Jockey Data History",
    description: "Showing today and tomorrow's records with pending submissions",
    historyDescription: "Showing all completed records with submission dates"
  }
}

export default function JockeyDataPage() {
  return (
    <DataPageLayout config={CONFIG} />
  )
}
"use client"

import DataPageLayout from "../../components/admin/DataPageLayout"

// Configuration for Service Data Page
const CONFIG = {
  // Configured to use same script URL as others typically, but checking original file value
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby0-aE9uNuU3yBJ9SAHvAfXycYt5vPyvAtlAauVy-xlH9rc4fPCGSQM6pvsqZ9QvSvbyg/exec",

  // Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: "1TzjAIpRAoz017MfzZ0gZaN-v5jyKtg7E",

  // Sheet name to work with
  SHEET_NAME: "SERVICE",

  // Page configuration
  PAGE_CONFIG: {
    title: "Service Data",
    historyTitle: "Service Data History",
    description: "Showing today and tomorrow's records with pending submissions",
    historyDescription: "Showing all completed records with submission dates"
  }
}

export default function ServiceDataPage() {
  return (
    <DataPageLayout config={CONFIG} />
  )
}
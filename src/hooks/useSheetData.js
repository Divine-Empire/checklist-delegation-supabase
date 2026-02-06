import { useState, useCallback, useMemo, useEffect } from "react"
import { formatDate } from "../utils/dateUtils"

const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRbhgAN0TfMUWOgZ1UPiOAsVyUrj7aDM0hOeybHvB-K7NniRVhwhH3foVs5l4u2N2z/exec"

export const useSheetData = (config) => {
    const {
        sheetName,
        scriptUrl = DEFAULT_APPS_SCRIPT_URL,
        driveFolderId,
        enableAdminFilters = true
    } = config;

    const [data, setData] = useState([])
    const [historyData, setHistoryData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Selection State
    const [selectedItems, setSelectedItems] = useState(new Set())
    const [additionalData, setAdditionalData] = useState({})
    const [remarksData, setRemarksData] = useState({})

    // Filter States
    const [searchTerm, setSearchTerm] = useState("")
    const [showHistory, setShowHistory] = useState(false)
    const [membersList, setMembersList] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Role & User
    const [userRole, setUserRole] = useState("")
    const [username, setUsername] = useState("")

    // Pending Tasks Admin Selection
    const [selectedPendingItems, setSelectedPendingItems] = useState([])
    const [markingActionProcessing, setMarkingActionProcessing] = useState(false)

    useEffect(() => {
        setUserRole(localStorage.getItem("role") || sessionStorage.getItem("role") || "")
        setUsername(localStorage.getItem("user-name") || sessionStorage.getItem("username") || "")
    }, [])

    // Date Parsing Utilities
    const parseGoogleSheetsDate = (dateStr) => {
        if (!dateStr) return ""

        if (typeof dateStr === "string" && dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateStr
        }

        if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
            const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateStr)
            if (match) {
                const year = Number.parseInt(match[1], 10)
                const month = Number.parseInt(match[2], 10)
                const day = Number.parseInt(match[3], 10)
                return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`
            }
        }

        try {
            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, "0")
                const month = (date.getMonth() + 1).toString().padStart(2, "0")
                const year = date.getFullYear()
                return `${day}/${month}/${year}`
            }
        } catch (error) {
            console.error("Error parsing date:", error)
        }

        return dateStr
    }

    const parseDateFromDDMMYYYY = (dateStr) => {
        if (!dateStr || typeof dateStr !== "string") return null
        const parts = dateStr.split("/")
        if (parts.length !== 3) return null
        return new Date(parts[2], parts[1] - 1, parts[0])
    }

    // Data Fetching
    const fetchData = useCallback(async () => {
        if (!sheetName) return;

        try {
            setLoading(true)
            const pendingRows = []
            const historyRowsList = []

            // Support differnt URL params if needed, mostly consistent
            const url = `${scriptUrl}?sheet=${sheetName}&action=fetch`;

            const response = await fetch(url)
            if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`)

            const text = await response.text()
            let jsonData
            try {
                jsonData = JSON.parse(text)
            } catch (parseError) {
                const jsonStart = text.indexOf("{")
                const jsonEnd = text.lastIndexOf("}")
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    jsonData = JSON.parse(text.substring(jsonStart, jsonEnd + 1))
                } else {
                    throw new Error("Invalid JSON response")
                }
            }

            // Normalize Rows
            let rows = []
            if (jsonData.table && jsonData.table.rows) {
                rows = jsonData.table.rows
            } else if (Array.isArray(jsonData)) {
                rows = jsonData
            } else if (jsonData.values) {
                rows = jsonData.values.map(row => ({ c: row.map(val => ({ v: val })) }))
            }

            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            today.setHours(0, 0, 0, 0)
            tomorrow.setHours(0, 0, 0, 0)

            const formatDateForCompare = (d) => {
                const day = d.getDate().toString().padStart(2, "0")
                const month = (d.getMonth() + 1).toString().padStart(2, "0")
                const year = d.getFullYear()
                return `${day}/${month}/${year}`
            }

            const todayStr = formatDateForCompare(today)
            const tomorrowStr = formatDateForCompare(tomorrow)

            const membersSet = new Set()
            const currentUsername = username || localStorage.getItem("user-name") || sessionStorage.getItem("username")
            const currentUserRole = userRole || localStorage.getItem("role") || sessionStorage.getItem("role")

            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) return // Skip header if included in data

                let rowValues = []
                if (row.c) {
                    rowValues = row.c.map(cell => cell && cell.v !== undefined ? cell.v : "")
                } else if (Array.isArray(row)) {
                    rowValues = row
                }

                // Column Config Extraction (Specific to RKL/Admin Sheet Structure)
                // Adjust these indices based on config if needed, but they seem consistent across data pages
                // Index 4 = Name/Given By (Member)
                // Index 6 = Start Date (G)
                // Index 10 = Actual/End Date (K - sometimes L depending on sheet, need to be careful)
                // Index 12 = Status
                // Index 15 = Admin Done

                // Dynamic Mapping via generic indices or config could be better, but sticking to observed pattern:
                const assignedTo = rowValues[4] || "Unassigned"
                membersSet.add(assignedTo)

                const isUserMatch = currentUserRole === "admin" || assignedTo.toLowerCase() === (currentUsername || '').toLowerCase()
                if (!isUserMatch && currentUserRole !== "admin") return

                // Standard RKL structure indices
                const startDatesVal = rowValues[6]
                const actualDateVal = rowValues[10] // Or 11 depending on page? Check accounts page. Accounts used 10 for Actual.
                // NOTE: Account page uses rowValues[10] for Column K.
                // NOTE: Admin page seems to use similar.

                // Let's assume standard indices for now, but allow config overrides if columns shift
                const statusVal = rowValues[12] // Column M
                const adminDoneVal = rowValues[15] // Column P

                if ((statusVal && String(statusVal).trim() === "DONE") ||
                    (adminDoneVal && String(adminDoneVal).trim() === "Done")) {
                    return
                }

                const dateStr = startDatesVal ? String(startDatesVal).trim() : ""
                const formattedDate = parseGoogleSheetsDate(dateStr)
                const rowDateObj = parseDateFromDDMMYYYY(formattedDate)

                // Create Row Object
                const taskId = rowValues[1]
                // Stable ID logic
                const stableId = taskId ? `task_${taskId}_${rowIndex + 1}` : `row_${rowIndex + 1}_${Math.random().toString(36).substr(2, 9)}`

                const rowData = {
                    _id: stableId,
                    _rowIndex: rowIndex + 1,
                    _taskId: taskId,
                    _raw: rowValues,
                    // Map common fields
                    task_id: taskId,
                    date: formattedDate,
                    name: assignedTo,
                    description: rowValues[5],
                    status: statusVal,
                    remarks: rowValues[13],
                    image: rowValues[14], // URL
                    // Dynamic binding for table
                    ...rowValues.reduce((acc, val, idx) => ({ ...acc, [`col${idx}`]: val }), {})
                }

                // Filtering Logic for Pending vs History
                // Pending: Has Start Date AND No End Date/Actual Date
                const isEmpty = (v) => v === null || v === undefined || String(v).trim() === ""
                const hasStartDate = !isEmpty(startDatesVal)
                const isActualEmpty = isEmpty(actualDateVal)

                if (hasStartDate && isActualEmpty) {
                    // Date Logic: Today, Tomorrow, or Past
                    // Compare purely on date strings if exact match, or object
                    // Account page logic: isToday || isTomorrow || isPastDate

                    let isPendingDate = false
                    if (formattedDate === todayStr || formattedDate === tomorrowStr) isPendingDate = true
                    if (rowDateObj && rowDateObj < today) isPendingDate = true

                    if (isPendingDate) {
                        pendingRows.push(rowData)
                    }
                } else if (hasStartDate && !isActualEmpty) {
                    // History
                    historyRowsList.push(rowData)
                }
            })

            setMembersList(Array.from(membersSet).sort())
            setData(pendingRows)
            setHistoryData(historyRowsList)
            setLoading(false)

        } catch (err) {
            console.error(err)
            setError(err.message)
            setLoading(false)
        }
    }, [sheetName, scriptUrl, username, userRole])

    // Filters
    const filteredData = useMemo(() => {
        let source = showHistory ? historyData : data

        return source.filter(item => {
            // Search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase()
                const match = Object.values(item).some(val =>
                    val && String(val).toLowerCase().includes(searchLower)
                )
                if (!match) return false
            }

            // Members
            if (selectedMembers.length > 0) {
                if (!selectedMembers.includes(item.name)) return false // name mapped from col4
            }

            // Date Range (History Only mostly)
            if (showHistory && (startDate || endDate)) {
                // Using col10 (Actual) for history date usually? Or col6 (Start)?
                // Account page used col10 for history date filter
                const dateVal = item['col10']
                const itemDate = parseDateFromDDMMYYYY(dateVal)

                if (!itemDate) return false

                if (startDate) {
                    const s = new Date(startDate)
                    s.setHours(0, 0, 0, 0)
                    if (itemDate < s) return false
                }
                if (endDate) {
                    const e = new Date(endDate)
                    e.setHours(23, 59, 59, 999)
                    if (itemDate > e) return false
                }
            }

            return true
        }).sort((a, b) => {
            // Sort by date (col6 for pending, col10 for history usually)
            const dateCol = showHistory ? 'col10' : 'col6'
            const dA = parseDateFromDDMMYYYY(a[dateCol])
            const dB = parseDateFromDDMMYYYY(b[dateCol])
            if (!dA) return 1
            if (!dB) return -1
            return showHistory ? dB - dA : dA - dB
        })

    }, [data, historyData, showHistory, searchTerm, selectedMembers, startDate, endDate])

    // Actions
    const toggleSelection = useCallback((id, isChecked) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (isChecked) newSet.add(id)
            else {
                newSet.delete(id)
                // Cleanup aux data
                setAdditionalData(p => { const n = { ...p }; delete n[id]; return n; })
                setRemarksData(p => { const n = { ...p }; delete n[id]; return n; })
            }
            return newSet
        })
    }, [])

    const selectAll = useCallback((isChecked) => {
        if (isChecked) {
            const ids = filteredData.map(i => i._id)
            setSelectedItems(new Set(ids))
        } else {
            setSelectedItems(new Set())
            setAdditionalData({})
            setRemarksData({})
        }
    }, [filteredData])

    const handleImageUpload = (id, file) => {
        setData(prev => prev.map(item => item._id === id ? { ...item, _newImage: file } : item))
    }

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
    })

    // Submit Logic
    const submitItems = async (itemsToSubmit = []) => {
        // If items not passed, use selected
        const ids = itemsToSubmit.length > 0 ? itemsToSubmit : Array.from(selectedItems)
        if (ids.length === 0) return { success: false, message: "No items selected" }

        const submissionData = await Promise.all(ids.map(async (id) => {
            const item = data.find(i => i._id === id) || historyData.find(i => i._id === id) // pending usually
            if (!item) return null

            let imageUrl = ""
            if (item._newImage && item._newImage instanceof File && driveFolderId) {
                // Upload Logic
                try {
                    const b64 = await fileToBase64(item._newImage)
                    const formData = new FormData()
                    formData.append("action", "uploadFile")
                    formData.append("base64Data", b64)
                    formData.append("fileName", `task_${item.task_id}_${Date.now()}.${item._newImage.name.split('.').pop()}`)
                    formData.append("mimeType", item._newImage.type)
                    formData.append("folderId", driveFolderId)

                    const res = await fetch(scriptUrl, { method: "POST", body: formData })
                    const json = await res.json()
                    if (json.success) imageUrl = json.fileUrl
                } catch (e) {
                    console.error("Upload failed", e)
                }
            }

            const today = new Date()
            const day = today.getDate().toString().padStart(2, "0")
            const month = (today.getMonth() + 1).toString().padStart(2, "0")
            const year = today.getFullYear()
            const todayStr = `${day}/${month}/${year}`

            return {
                taskId: item.task_id,
                rowIndex: item._rowIndex,
                actualDate: todayStr,
                status: additionalData[id] || "",
                remarks: remarksData[id] || "",
                imageUrl: imageUrl
            }
        }))

        const payload = {
            sheetName,
            action: "updateTaskData",
            rowData: JSON.stringify(submissionData.filter(Boolean))
        }

        const formData = new FormData()
        Object.entries(payload).forEach(([k, v]) => formData.append(k, v))

        const res = await fetch(scriptUrl, { method: "POST", body: formData })
        const json = await res.json()

        if (json.success) {
            // Cleanup local state
            setData(prev => prev.filter(i => !ids.includes(i._id)))
            setSelectedItems(new Set())
            setAdditionalData({})
            setRemarksData({})

            // Refresh background
            setTimeout(fetchData, 1500)
            return { success: true }
        } else {
            return { success: false, message: json.error }
        }
    }

    return {
        data: filteredData,
        loading,
        error,
        filters: {
            searchTerm, setSearchTerm,
            showHistory, setShowHistory,
            membersList,
            selectedMembers, setSelectedMembers,
            startDate, setStartDate,
            endDate, setEndDate,
            resetFilters: () => {
                setSearchTerm("")
                setSelectedMembers([])
                setStartDate("")
                setEndDate("")
            }
        },
        selection: {
            selectedItems,
            toggleSelection,
            selectAll,
            additionalData, setAdditionalData,
            remarksData, setRemarksData,
            handleImageUpload
        },
        actions: {
            fetchData,
            submitItems
        },
        // Meta
        rawHistoryData: historyData,
        rawData: data
    }
}

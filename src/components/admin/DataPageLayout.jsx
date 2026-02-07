import React, { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { Search, History, ArrowLeft, CheckCircle2, X, Upload } from 'lucide-react';
import { useSheetData } from '../../hooks/useSheetData';
import DataTable from './DataTable';

const DataPageLayout = ({
    // Smart Mode Props (if config is passed)
    config,

    // Manual Mode Props (if used as wrapper)
    title: manualTitle,
    description: manualDescription,
    showHistory: manualShowHistory,
    onToggleHistory: manualOnToggleHistory,
    searchTerm: manualSearchTerm,
    onSearchChange: manualOnSearchChange,
    actions: manualActions,
    children,
    error: manualError,
    successMessage: manualSuccessMessage,
    onClearSuccess: manualOnClearSuccess
}) => {
    // Determine mode
    const isSmartMode = !!config;

    // Smart Mode State & Logic
    const configData = isSmartMode ? config : {};
    const {
        data,
        loading,
        error: smartError,
        filters,
        selection,
        actions: smartActions,
    } = useSheetData(isSmartMode ? {
        sheetName: configData.SHEET_NAME,
        sheetId: configData.SHEET_ID,
        scriptUrl: configData.SCRIPT_URL || configData.APPS_SCRIPT_URL,
        driveFolderId: configData.DRIVE_FOLDER_ID,
        columnMapping: configData.COLUMN_MAPPING
    } : { sheetName: '' });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSmartSubmit = async () => {
        setSubmitLoading(true);
        const res = await smartActions.submitItems();
        setSubmitLoading(true); // Keep loading briefly for effect or clear it
        setSubmitLoading(false);
        if (res.success) setSuccessMsg("Submitted successfully!");
        else alert("Error: " + res.message);
    };

    // Unified Props
    const title = isSmartMode ? (filters.showHistory ? configData.PAGE_CONFIG.historyTitle : configData.PAGE_CONFIG.title) : manualTitle;
    const description = isSmartMode ? (filters.showHistory ? configData.PAGE_CONFIG.historyDescription : configData.PAGE_CONFIG.description) : manualDescription;
    const showHistory = isSmartMode ? filters.showHistory : manualShowHistory;
    const onToggleHistory = isSmartMode ? () => filters.setShowHistory(!filters.showHistory) : manualOnToggleHistory;
    const searchTerm = isSmartMode ? filters.searchTerm : manualSearchTerm;
    const onSearchChange = isSmartMode ? filters.setSearchTerm : manualOnSearchChange;
    const error = isSmartMode ? smartError : manualError;
    const successMessage = isSmartMode ? successMsg : manualSuccessMessage;
    const onClearSuccess = isSmartMode ? () => setSuccessMsg("") : manualOnClearSuccess;

    // Smart Mode Columns
    const defaultColumns = isSmartMode ? [
        { label: "Timestamp", key: "col0" },
        { label: "Task ID", key: "col1" },
        { label: "Firm", key: "col2" },
        { label: "Given By", key: "col3" },
        { label: "Name", key: "col4" },
        { label: "Description", key: "col5" },
        { label: "Start Date", key: "col6" },
        { label: "Freq", key: "col7" },
        { label: "Enable Reminders", key: "col8" },
        { label: "Attachment Req", key: "col9" },
        { label: "Actual Date", key: "col10" },
        { label: "Column L", key: "col11" },
        { label: "Status", key: "col12" },
        { label: "Remarks", key: "col13" },
        {
            label: "Image",
            key: "col14",
            render: (item) => item.col14 && String(item.col14).startsWith("http") ? (
                <a href={item.col14} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
            ) : item.col14
        },
        { label: "Admin Done", key: "col15" },
        ...(!filters.showHistory ? [{
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
                        {item.col9 && String(item.col9).toUpperCase() === "YES" && (
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
    ] : [];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-purple-700">
                        {title}
                    </h1>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={showHistory ? "Search history..." : "Search tasks..."}
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <button
                            onClick={onToggleHistory}
                            className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 py-2 px-4 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                        >
                            {showHistory ? (
                                <>
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    <span>Back to Tasks</span>
                                </>
                            ) : (
                                <>
                                    <History className="h-4 w-4 mr-1" />
                                    <span>View History</span>
                                </>
                            )}
                        </button>

                        {/* Extra Actions */}
                        {isSmartMode && !showHistory && (
                            <button
                                onClick={handleSmartSubmit}
                                disabled={selection.selectedItems.size === 0 || submitLoading}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                            >
                                {submitLoading ? "Submitting..." : `Submit (${selection.selectedItems.size})`}
                            </button>
                        )}
                        {manualActions}
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                            {successMessage}
                        </div>
                        <button onClick={onClearSuccess} className="text-green-500 hover:text-green-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                        <h2 className="text-purple-700 font-medium">
                            {showHistory ? "History" : "Tasks"}
                        </h2>
                        <p className="text-purple-600 text-sm">
                            {description}
                        </p>
                    </div>

                    {/* Member Filter in Smart Mode */}
                    {isSmartMode && (
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
                    )}

                    {isSmartMode ? (
                        <DataTable
                            data={data}
                            loading={loading}
                            columns={defaultColumns}
                            selection={selection}
                            showHistory={showHistory}
                        />
                    ) : (
                        children
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default DataPageLayout;

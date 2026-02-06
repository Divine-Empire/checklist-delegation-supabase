import React from 'react';
import AdminLayout from '../layout/AdminLayout';
import { Search, History, ArrowLeft, CheckCircle2, X } from 'lucide-react';

const DataPageLayout = ({
    title,
    description,
    showHistory,
    onToggleHistory,
    searchTerm,
    onSearchChange,
    actions, // extra buttons
    children,
    error,
    successMessage,
    onClearSuccess
}) => {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-purple-700">
                        {title}
                    </h1>

                    <div className="flex space-x-4">
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
                            className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 py-2 px-4 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {showHistory ? (
                                <div className="flex items-center">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    <span>Back to Tasks</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <History className="h-4 w-4 mr-1" />
                                    <span>View History</span>
                                </div>
                            )}
                        </button>

                        {/* Extra Actions (Submit, etc) */}
                        {actions}
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

                    {children}
                </div>
            </div>
        </AdminLayout>
    );
};

export default DataPageLayout;

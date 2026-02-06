import React from 'react';
import useMisReportUIStore from '../../stores/useMisReportUIStore';
import { CONFIG } from '../../config/misReportConfig';

const StaffTable = ({
    filteredStaffMembers,
    staffMembers,
    isLoading,
    loadMore,
    hasMoreData,
    totalUsersCount,
    totalStaffCount
}) => {
    const { searchQuery, staffFilter } = useMisReportUIStore();

    return (
        <div className="rounded-lg border border-purple-200 shadow-md bg-white">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-purple-700 font-medium">Staff Performance Details</h3>
                        <p className="text-xs text-gray-600">Showing combined checklist and delegation data</p>
                    </div>
                    <div className="flex gap-2">
                        {staffFilter !== "all" && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Staff: {staffFilter}</span>}
                        {searchQuery && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Search: "{searchQuery}"</span>}
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {/* Counts */}
                    <div className="text-sm text-gray-600">
                        {searchQuery ? `Showing ${filteredStaffMembers.length} of ${staffMembers.length} staff members` : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span>Total Users: <strong>{totalUsersCount}</strong></span>
                                <span className="hidden sm:inline">•</span>
                                <span>Showing: <strong>{staffMembers.length}</strong>{hasMoreData && '+'}</span>
                            </div>
                        )}
                    </div>

                    {filteredStaffMembers.length === 0 && !isLoading ? (
                        <div className="text-center p-8 text-gray-500">
                            {searchQuery ? "No staff members found matching your search." : "No staff data found."}
                        </div>
                    ) : (
                        <>
                            <div className="staff-table-container rounded-md border border-gray-200 overflow-auto" style={{ maxHeight: "500px" }}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seq No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Tasks <div className="text-xs font-normal text-gray-400 mt-1">(C + D)</div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Completed <div className="text-xs font-normal text-gray-400 mt-1">(C + D)</div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checklist Pending</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delegation Pending</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStaffMembers.map((staff, index) => (
                                            <tr key={`${staff.name}-${index}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                                        <div className="text-xs text-gray-500">{staff.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-medium">{staff.totalTasks}</div>
                                                    <div className="text-xs text-gray-400">({staff.checklistTotal || 0} + {staff.delegationTotal || 0})</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-medium">{staff.completedTasks}</div>
                                                    <div className="text-xs text-gray-400">({staff.checklistCompleted || 0} + {staff.delegationCompleted || 0})</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                                    <div className="font-medium">{staff.pendingTasks}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                                                    {staff.delegationPending || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-[100px] bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${staff.progress}%` }}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{staff.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {staff.progress >= 80 ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Excellent</span>
                                                    ) : staff.progress >= 60 ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Good</span>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Needs Improvement</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {hasMoreData && !searchQuery && (
                                <div className="flex justify-center">
                                    <button onClick={loadMore} disabled={isLoading} className="px-6 py-2 text-black rounded-md transition-colors flex items-center gap-2 border border-gray-300 hover:bg-gray-100">
                                        {isLoading ? "Loading..." : `Load More (${Math.min(CONFIG.ITEMS_PER_PAGE, totalStaffCount - staffMembers.length)} more)`}
                                    </button>
                                </div>
                            )}
                            {!hasMoreData && staffMembers.length > 0 && !searchQuery && (
                                <div className="text-center py-4 text-sm text-gray-500">All {staffMembers.length} staff members loaded</div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffTable;

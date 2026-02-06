import React from 'react';
import useMisReportUIStore from '../../stores/useMisReportUIStore';
import { CONFIG } from '../../config/misReportConfig';

const MisReportHeader = ({ availableStaff }) => {
    const { searchQuery, setSearchQuery, staffFilter, setStaffFilter } = useMisReportUIStore();

    return (
        <div className="bg-white rounded-lg border border-purple-200 shadow-md">
            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Title Section */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-purple-700">{CONFIG.PAGE_CONFIG.title}</h1>
                        <p className="text-sm text-gray-600 mt-1">{CONFIG.PAGE_CONFIG.description}</p>
                    </div>

                    {/* Filters Section */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Bar */}
                        <div className="w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search staff..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                            />
                        </div>

                        {/* Staff Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={staffFilter}
                                onChange={(e) => setStaffFilter(e.target.value)}
                                className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">All Staff</option>
                                {availableStaff.map((staff) => (
                                    <option key={staff} value={staff}>
                                        {staff}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MisReportHeader;

import React from 'react';
import { Pencil, Trash2 } from "lucide-react";
import useHolidayStore from '../../stores/useHolidayStore';

const HolidayTable = ({ handleDelete, handleEdit }) => {
    const { holidays, fetchLoading } = useHolidayStore();

    if (fetchLoading) {
        return (
            <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-purple-600 text-sm sm:text-base">Loading holidays...</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-3 sm:p-4">
                <h2 className="text-purple-700 font-medium text-sm sm:text-base">
                    Holiday Records
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Day</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Holiday Name</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {holidays.length > 0 ? (
                            holidays.map((h, i) => (
                                <tr key={h.id || i} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="text-xs sm:text-sm font-medium text-gray-900">{i + 1}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="text-xs sm:text-sm text-gray-900">{h.day}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="text-xs sm:text-sm text-gray-900">{h.date}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 min-w-[200px]">
                                        <div className="text-xs sm:text-sm text-gray-900 break-words" title={h.name}>{h.name}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="flex gap-2">
                                            <Pencil
                                                size={16}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                onClick={() => handleEdit(i)}
                                                title="Edit"
                                            />
                                            <Trash2
                                                size={16}
                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                                onClick={() => handleDelete(i)}
                                                title="Delete"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-4 sm:px-6 py-4 text-center text-gray-500 text-xs sm:text-sm">
                                    No holidays found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HolidayTable;

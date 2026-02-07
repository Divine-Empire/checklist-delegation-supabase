import React from 'react';
import { Pencil, Trash2 } from "lucide-react";
import useHolidayStore from '../../stores/useHolidayStore';

const WorkingDayTable = ({ handleOpenWorkingDayAddModal, handleDelete, handleEdit }) => {
    const { workingDays, fetchLoading } = useHolidayStore(); // reusing fetchLoading since generally they load together or we can add specific one if needed, but original used one for main or separated.
    // Actually, store has workingDayLoading for actions, and fetchLoading was used for holidays. 
    // Need to check if I added workingDaySpecific fetch loading? No, I reused fetchLoading in my thought process but maybe store had it? 
    // In store: `fetchLoading` (generic). 
    // In hooks: `fetchWorkingDays` sets `setFetchLoading(true)`.
    // So `fetchLoading` is shared. That's fine for now as they load on mount.

    return (
        <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-3 sm:p-4 flex justify-between items-center">
                <h2 className="text-purple-700 font-medium text-sm sm:text-base">
                    📅 Working Days Records
                </h2>
                <button
                    onClick={handleOpenWorkingDayAddModal}
                    className="rounded-md bg-purple-600 py-1.5 px-3 text-white hover:bg-purple-700 text-xs sm:text-sm"
                >
                    + Add Working Day
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Working Date</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Day</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {workingDays.length > 0 ? (
                            workingDays.map((wd, i) => (
                                <tr key={wd.id || i} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="text-xs sm:text-sm font-medium text-gray-900">{i + 1}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="text-xs sm:text-sm text-gray-900">{wd.working_date}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="text-xs sm:text-sm text-gray-900">{wd.day}</div>
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
                                <td colSpan="4" className="px-4 sm:px-6 py-4 text-center text-gray-500 text-xs sm:text-sm">
                                    No working days found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkingDayTable;

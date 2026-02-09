import React from 'react';
import { Upload } from 'lucide-react';
import useDelegationUIStore from '../../stores/useDelegationUIStore';
import { formatDateTimeForDisplay } from '../../utils/dateParsing';

const DelegationTable = ({ tasks }) => {
    const {
        selectedItems, toggleSelection, selectAll,
        statusData, updateStatus,
        nextTargetDate, updateNextTargetDate,
        remarksData, updateRemarks,
        uploadedImages, uploadImage
    } = useDelegationUIStore();

    const getRowColor = (colorCode) => {
        const code = colorCode?.toString().toLowerCase();
        switch (code) {
            case "red": return "bg-red-50 border-l-4 border-red-400";
            case "yellow": return "bg-yellow-50 border-l-4 border-yellow-400";
            case "green": return "bg-green-50 border-l-4 border-green-400";
            case "blue": return "bg-blue-50 border-l-4 border-blue-400";
            default: return "bg-white";
        }
    };

    const selectableTasks = tasks.filter(item => {
        if (!item.task_start_date) return true;
        const taskDate = new Date(item.task_start_date);
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        return taskDateOnly <= today;
    });

    return (
        <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-3 sm:p-4">
                <h2 className="text-purple-700 font-medium text-sm sm:text-base">Ongoing Tasks</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seq</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    checked={selectableTasks.length > 0 && selectedItems.size === selectableTasks.length}
                                    onChange={(e) => selectAll(selectableTasks.map(t => t.task_id), e.target.checked)}
                                />
                            </th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Task ID</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Department</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Given By</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">Description</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-yellow-50">Start Date</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-green-50">Planned Date</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-blue-50">Status</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-indigo-50">Next Target</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] bg-purple-50">Remarks</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-orange-50">Upload</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.length > 0 ? tasks.map((item, index) => {
                            const isSelected = selectedItems.has(item.task_id);
                            const isUpcoming = (() => {
                                if (!item.task_start_date) return false;
                                const startDate = new Date(item.task_start_date);
                                const today = new Date(new Date().setHours(0, 0, 0, 0));
                                const taskDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                                return taskDateOnly > today;
                            })();

                            return (
                                <tr key={index} className={`${isSelected ? "bg-purple-50" : ""} hover:bg-gray-50 ${getRowColor(item.color_code_for)}`}>
                                    <td className="px-2 py-4 text-xs text-gray-900">{index + 1}</td>
                                    <td className="px-2 py-4 text-center">
                                        {item.task_start_date && (() => {
                                            const startDate = new Date(item.task_start_date);
                                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                                            const taskDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

                                            if (taskDateOnly < today) {
                                                return (
                                                    <div className="mb-1">
                                                        <span className="bg-red-600 text-white text-[9px] font-black px-1 rounded-sm uppercase">Overdue</span>
                                                    </div>
                                                );
                                            } else if (taskDateOnly.getTime() === today.getTime()) {
                                                return (
                                                    <div className="mb-1">
                                                        <span className="bg-orange-500 text-white text-[9px] font-black px-1 rounded-sm uppercase">Today</span>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div className="mb-1">
                                                        <span className="bg-blue-500 text-white text-[9px] font-black px-1 rounded-sm uppercase whitespace-nowrap">Upcoming</span>
                                                    </div>
                                                );
                                            }
                                        })()}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => toggleSelection(item.task_id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isUpcoming}
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-xs text-gray-900">{item.task_id}</td>
                                    <td className="px-2 py-4 text-xs text-gray-900">{item.department}</td>
                                    <td className="px-2 py-4 text-xs text-gray-900">{item.given_by}</td>
                                    <td className="px-2 py-4 text-xs text-gray-900">{item.name}</td>
                                    <td className="px-2 py-4 min-w-[200px] max-w-[300px]">
                                        <div className="text-xs text-gray-900 break-words" title={item.task_description}>{item.task_description}</div>
                                    </td>
                                    <td className="px-2 py-4 bg-yellow-50 text-xs text-gray-900">{formatDateTimeForDisplay(item.task_start_date)}</td>
                                    <td className="px-2 py-4 bg-green-50 text-xs text-gray-900">{formatDateTimeForDisplay(item.planned_date)}</td>

                                    {/* Inputs */}
                                    <td className="px-2 py-4 bg-blue-50">
                                        <select
                                            disabled={!isSelected}
                                            value={statusData[item.task_id] || ""}
                                            onChange={(e) => updateStatus(item.task_id, e.target.value)}
                                            className="border border-gray-300 rounded-md px-2 py-1 w-full disabled:bg-gray-100 text-xs"
                                        >
                                            <option value="">Select</option>
                                            <option value="Done">Done</option>
                                            <option value="Extend date">Extend</option>
                                        </select>
                                    </td>
                                    <td className="px-2 py-4 bg-indigo-50">
                                        <input
                                            type="date"
                                            disabled={!isSelected || statusData[item.task_id] !== "Extend date"}
                                            value={nextTargetDate[item.task_id] || ""}
                                            onChange={(e) => updateNextTargetDate(item.task_id, e.target.value)}
                                            className="border border-gray-300 rounded-md px-2 py-1 w-full disabled:bg-gray-100 text-xs"
                                        />
                                    </td>
                                    <td className="px-2 py-4 bg-purple-50 min-w-[150px]">
                                        <textarea
                                            disabled={!isSelected}
                                            value={remarksData[item.task_id] || ""}
                                            onChange={(e) => updateRemarks(item.task_id, e.target.value)}
                                            className="border rounded-md px-2 py-1 w-full border-gray-300 disabled:bg-gray-100 text-xs resize-none"
                                            rows="2"
                                            placeholder="Enter remarks"
                                        />
                                    </td>
                                    <td className="px-2 py-4 bg-orange-50">
                                        {uploadedImages[item.task_id] ? (
                                            <div className="flex items-center">
                                                <img src={URL.createObjectURL(uploadedImages[item.task_id])} alt="preview" className="h-8 w-8 object-cover rounded mr-2" />
                                                <span className="text-xs text-green-600">Ready</span>
                                            </div>
                                        ) : item.image ? (
                                            <div className="flex items-center">
                                                <img src={item.image} alt="uploaded" className="h-8 w-8 object-cover rounded mr-2" />
                                                <button onClick={() => window.open(item.image, "_blank")} className="text-xs text-purple-600">View</button>
                                            </div>
                                        ) : (
                                            <label className={`flex items-center cursor-pointer ${item.require_attachment?.toUpperCase() === "YES" ? "text-red-600 font-medium" : "text-purple-600"}`}>
                                                <Upload className="h-4 w-4 mr-1" />
                                                <span className="text-xs">{item.require_attachment?.toUpperCase() === "YES" ? "Required*" : "Upload"}</span>
                                                <input type="file" className="hidden" accept="image/*" disabled={!isSelected} onChange={(e) => uploadImage(item.task_id, e.target.files[0])} />
                                            </label>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={13} className="px-4 py-4 text-center text-gray-500">No pending tasks found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DelegationTable;

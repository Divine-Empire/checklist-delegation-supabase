import React from 'react';
import { Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import useQuickTaskUIStore from '../../stores/useQuickTaskUIStore';

const ChecklistTable = ({
    tasks,
    userRole,
    tableRef,
    loading,
    hasMore,
    onSave,
    onCancel,
    isSaving
}) => {
    const {
        selectedTasks, toggleTaskSelection, selectAllTasks,
        sortConfig, setSortConfig,
        editingTaskId, editFormData, updateEditForm, startEditing, cancelEditing
    } = useQuickTaskUIStore();

    const handleSelectAll = (e) => {
        if (e.target.checked) selectAllTasks(tasks);
        else selectAllTasks([]);
    };

    const formatTimestampToDDMMYYYY = (timestamp) => {
        if (!timestamp) return "—";
        try {
            const date = new Date(timestamp);
            return isNaN(date.getTime()) ? timestamp : format(date, 'dd/MM/yyyy');
        } catch { return timestamp; }
    };

    const renderSortHeader = (label, key, bg = "") => (
        <th
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${bg} cursor-pointer hover:bg-gray-100`}
            onClick={() => key && setSortConfig(key)}
        >
            <div className="flex items-center">
                {label}
                {sortConfig.key === key && <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
            </div>
        </th>
    );

    return (
        <div className="mt-4 rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
            <div ref={tableRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-20">
                        <tr>
                            {userRole === 'admin' && (
                                <th className="px-4 py-3 w-12 text-left">
                                    <input
                                        type="checkbox"
                                        checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                            )}
                            {renderSortHeader("Department", "department")}
                            {renderSortHeader("Given By", "given_by")}
                            {renderSortHeader("Name", "name")}
                            {renderSortHeader("Task Description", "task_description")}
                            {renderSortHeader("Start Date", "task_start_date", "bg-yellow-50")}
                            {renderSortHeader("End Date", "submission_date", "bg-yellow-50")}
                            {renderSortHeader("Frequency", "frequency")}
                            {renderSortHeader("Reminders", "enable_reminder")}
                            {renderSortHeader("Attachment", "require_attachment")}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.length > 0 ? tasks.map((task, index) => {
                            const isEditing = editingTaskId === task.task_id;
                            const isSelected = selectedTasks.some(t => t.task_id === task.task_id);

                            return (
                                <tr key={index} className="hover:bg-gray-50">
                                    {userRole === 'admin' && (
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleTaskSelection(task)}
                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                    )}

                                    {/* Department */}
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {isEditing ? (
                                            <input value={editFormData.department} onChange={e => updateEditForm('department', e.target.value)} className="w-full border rounded px-2 py-1" />
                                        ) : task.department}
                                    </td>

                                    {/* Given By */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {isEditing ? (
                                            <input value={editFormData.given_by} onChange={e => updateEditForm('given_by', e.target.value)} className="w-full border rounded px-2 py-1" />
                                        ) : task.given_by}
                                    </td>

                                    {/* Name */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {isEditing ? (
                                            <input value={editFormData.name} onChange={e => updateEditForm('name', e.target.value)} className="w-full border rounded px-2 py-1" />
                                        ) : task.name}
                                    </td>

                                    {/* Description */}
                                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[300px]">
                                        {isEditing ? (
                                            <textarea value={editFormData.task_description} onChange={e => updateEditForm('task_description', e.target.value)} className="w-full border rounded px-2 py-1" rows="3" />
                                        ) : task.task_description}
                                    </td>

                                    {/* Start Date */}
                                    <td className="px-6 py-4 text-sm text-gray-500 bg-yellow-50">
                                        {isEditing ? (
                                            <input type="datetime-local" value={editFormData.task_start_date ? new Date(editFormData.task_start_date).toISOString().slice(0, 16) : ''} onChange={e => updateEditForm('task_start_date', e.target.value)} className="w-full border rounded px-2 py-1" />
                                        ) : formatTimestampToDDMMYYYY(task.task_start_date)}
                                    </td>

                                    {/* End Date */}
                                    <td className="px-6 py-4 text-sm text-gray-500 bg-yellow-50">
                                        {formatTimestampToDDMMYYYY(task.submission_date)}
                                    </td>

                                    {/* Frequency */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {isEditing ? (
                                            <select value={editFormData.frequency} onChange={e => updateEditForm('frequency', e.target.value)} className="w-full border rounded px-2 py-1">
                                                <option value="">Select</option>
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs ${task.frequency === 'Daily' ? 'bg-blue-100 text-blue-800' : task.frequency === 'Weekly' ? 'bg-green-100 text-green-800' : task.frequency === 'Monthly' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {task.frequency}
                                            </span>
                                        )}
                                    </td>

                                    {/* Reminder */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {isEditing ? (
                                            <select value={editFormData.enable_reminder} onChange={e => updateEditForm('enable_reminder', e.target.value)} className="w-full border rounded px-2 py-1">
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        ) : task.enable_reminder || "—"}
                                    </td>

                                    {/* Attachment */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {isEditing ? (
                                            <select value={editFormData.require_attachment} onChange={e => updateEditForm('require_attachment', e.target.value)} className="w-full border rounded px-2 py-1">
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        ) : task.require_attachment || "—"}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <button onClick={onSave} disabled={isSaving} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                                    <Save size={14} /> {isSaving ? '...' : 'Save'}
                                                </button>
                                                <button onClick={cancelEditing} className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEditing(task)} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                <Edit size={14} /> Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={11} className="px-6 py-4 text-center text-gray-500">No tasks found</td></tr>
                        )}
                    </tbody>
                </table>
                {loading && hasMore && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChecklistTable;

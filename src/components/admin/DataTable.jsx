import React from 'react';
import { Upload } from 'lucide-react';

const DataTable = ({
    data,
    columns,
    loading,
    selection, // { selectedItems, toggleSelection, selectAll, additionalData, remarksData, handleImageUpload ... }
    showHistory,
    showSelection = true
}) => {

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-purple-600">Loading data...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                No records found.
            </div>
        )
    }

    const { selectedItems = new Set(), toggleSelection, selectAll, additionalData, setAdditionalData, remarksData, setRemarksData, handleImageUpload } = selection || {};
    const allSelected = data.length > 0 && selectedItems.size === data.length;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {showSelection && !showHistory && (
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => selectAll && selectAll(e.target.checked)}
                                    className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, rowIndex) => {
                        const isSelected = selectedItems.has(item._id);

                        return (
                            <tr key={item._id} className={isSelected ? "bg-purple-50" : "hover:bg-gray-50 bg-white"}>
                                {showSelection && !showHistory && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => toggleSelection(item._id, e.target.checked)}
                                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                        />
                                    </td>
                                )}

                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {/* Render Custom Logic or Default */}
                                        {col.render ? col.render(item,
                                            {
                                                isSelected,
                                                additionalData, setAdditionalData,
                                                remarksData, setRemarksData,
                                                handleImageUpload
                                            }
                                        ) : (
                                            item[col.key] || item[col.id] || ""
                                        )}
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;

import React from 'react';
import { useSelector } from 'react-redux';
import { Edit } from 'lucide-react';
import useSettingUIStore from '../../stores/useSettingUIStore';
import { useDepartmentManagement } from '../../hooks/useDepartmentManagement';

const DepartmentTable = () => {
    const { department, loading, error } = useSelector((state) => state.setting);
    const { activeDeptSubTab, setActiveDeptSubTab } = useSettingUIStore();
    const { handleEditDepartment } = useDepartmentManagement();

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-purple-200">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple px-6 py-4 border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-purple-700">Department Management</h2>

                    {/* Sub-tabs */}
                    <div className="flex border border-purple-200 rounded-md overflow-hidden">
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeDeptSubTab === 'departments' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                            onClick={() => setActiveDeptSubTab('departments')}
                        >
                            Departments
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeDeptSubTab === 'givenBy' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                            onClick={() => setActiveDeptSubTab('givenBy')}
                        >
                            Given By
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md m-4">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            )}

            {/* Departments Sub-tab */}
            {activeDeptSubTab === 'departments' && !loading && (
                <div className="h-[calc(100vh-275px)] overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {department && department.length > 0 ? (
                                Array.from(new Map(department.map(dept => [dept.department, dept])).values())
                                    .filter(dept => dept?.department && dept.department.trim() !== '')
                                    .map((dept, index) => (
                                        <tr key={dept.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditDepartment(dept.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No departments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Given By Sub-tab */}
            {activeDeptSubTab === 'givenBy' && !loading && (
                <div className="h-[calc(100vh-275px)] overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Given By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {department && department.length > 0 ? (
                                Array.from(new Map(department.map(dept => [dept.given_by, dept])).values())
                                    .filter(dept => dept?.given_by && dept.given_by.trim() !== '')
                                    .map((dept, index) => (
                                        <tr key={dept.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.given_by}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditDepartment(dept.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No given by data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DepartmentTable;

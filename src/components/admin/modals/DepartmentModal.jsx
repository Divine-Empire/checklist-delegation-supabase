import React from 'react';
import { X, Save } from 'lucide-react';
import useSettingUIStore from '../../../stores/useSettingUIStore';

const DepartmentModal = ({ handleAddDepartment, handleUpdateDepartment }) => {
    const {
        showDeptModal, setShowDeptModal, currentDeptId,
        deptForm, setDeptForm
    } = useSettingUIStore();

    if (!showDeptModal) return null;

    const handleDeptInputChange = (e) => {
        const { name, value } = e.target;
        setDeptForm({ [name]: value });
    };

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {currentDeptId ? 'Edit Department' : 'Create New Department'}
                            </h3>
                            <button
                                onClick={() => setShowDeptModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mt-6">
                            <form onSubmit={currentDeptId ? handleUpdateDepartment : handleAddDepartment}>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-6">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Department Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={deptForm.name}
                                            onChange={handleDeptInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="givenBy" className="block text-sm font-medium text-gray-700">
                                            Given By
                                        </label>
                                        <input
                                            type="text"
                                            id="givenBy"
                                            name="givenBy"
                                            value={deptForm.givenBy}
                                            onChange={handleDeptInputChange}
                                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Enter Given By"
                                        />
                                    </div>

                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeptModal(false)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Save size={18} className="mr-2" />
                                        {currentDeptId ? 'Update Department' : 'Save Department'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentModal;

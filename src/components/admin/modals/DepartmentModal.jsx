import React from 'react';
import { Save } from 'lucide-react';
import useSettingUIStore from '../../../stores/useSettingUIStore';
import Modal from '../../common/Modal';

const DepartmentModal = ({ handleAddDepartment, handleUpdateDepartment }) => {
    const {
        showDeptModal, setShowDeptModal, currentDeptId,
        deptForm, setDeptForm
    } = useSettingUIStore();

    const handleDeptInputChange = (e) => {
        const { name, value } = e.target;
        setDeptForm({ [name]: value });
    };

    return (
        <Modal
            isOpen={showDeptModal}
            onClose={() => setShowDeptModal(false)}
            title={currentDeptId ? 'Edit Department' : 'Create New Department'}
        >
            <div className="mt-2">
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

                    <div className="mt-8 flex justify-end space-x-3">
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
        </Modal>
    );
};

export default DepartmentModal;

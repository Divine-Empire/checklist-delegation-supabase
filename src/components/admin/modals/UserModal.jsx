import React from 'react';
import { Save } from 'lucide-react';
import useSettingUIStore from '../../../stores/useSettingUIStore';
import Modal from '../../common/Modal';

const UserModal = ({ handleAddUser, handleUpdateUser, departmentList }) => {
    const {
        showUserModal, setShowUserModal, isEditing,
        userForm, setUserForm
    } = useSettingUIStore();

    const handleUserInputChange = (e) => {
        const { name, value } = e.target;
        setUserForm({ [name]: value });
    };

    return (
        <Modal
            isOpen={showUserModal}
            onClose={() => setShowUserModal(false)}
            title={isEditing ? 'Edit User' : 'Create New User'}
            maxWidth="sm:max-w-2xl"
        >
            <div className="mt-2">
                <form onSubmit={isEditing ? handleUpdateUser : handleAddUser}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={userForm.username}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={userForm.email}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {!isEditing && (
                            <div className="sm:col-span-3">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={userForm.password}
                                    onChange={handleUserInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        )}

                        <div className="sm:col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={userForm.phone}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                                Employee ID
                            </label>
                            <input
                                type="text"
                                name="employee_id"
                                id="employee_id"
                                value={userForm.employee_id}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter Employee ID"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={userForm.role}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <select
                                id="department"
                                name="department"
                                value={userForm.department}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Select Department</option>
                                {departmentList && departmentList.length > 0 ? (
                                    [...new Set(departmentList.map(dept => dept.department))]
                                        .filter(deptName => deptName)
                                        .map((deptName, index) => (
                                            <option key={index} value={deptName}>
                                                {deptName}
                                            </option>
                                        ))
                                ) : (
                                    <option value="" disabled>Loading departments...</option>
                                )}
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={userForm.status}
                                onChange={handleUserInputChange}
                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowUserModal(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Save size={18} className="mr-2" />
                            {isEditing ? 'Update User' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default UserModal;

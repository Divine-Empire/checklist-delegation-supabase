import React from 'react';
import { useSelector } from 'react-redux';
import { Edit, Search, ChevronDown, X } from 'lucide-react';
import useSettingUIStore from '../../stores/useSettingUIStore';
import { useUserManagement } from '../../hooks/useUserManagement';

const UserTable = () => {
    const { userData } = useSelector((state) => state.setting);
    const {
        usernameFilter, setUsernameFilter,
        usernameDropdownOpen, toggleUsernameDropdown,
        setUsernameDropdownOpen // need simple toggle or set logic
    } = useSettingUIStore();

    const { handleEditUser } = useUserManagement();

    // Helper functions for UI
    const getStatusColor = (status) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'manager': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleUsernameFilterSelect = (username) => {
        setUsernameFilter(username);
        setUsernameDropdownOpen(false);
    };

    const clearUsernameFilter = () => {
        setUsernameFilter('');
        setUsernameDropdownOpen(false);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-purple-200">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple px-6 py-4 border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-purple-700">User List</h2>

                {/* Username Filter */}
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                list="usernameOptions"
                                placeholder="Filter by username..."
                                value={usernameFilter}
                                onChange={(e) => setUsernameFilter(e.target.value)}
                                className="w-48 pl-10 pr-8 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                            <datalist id="usernameOptions">
                                {userData?.map(user => (
                                    <option key={user.id} value={user.user_name} />
                                ))}
                            </datalist>

                            {usernameFilter && (
                                <button
                                    onClick={clearUsernameFilter}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setUsernameDropdownOpen(!usernameDropdownOpen)}
                            className="flex items-center gap-1 px-3 py-2 border border-purple-200 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <ChevronDown size={16} className={`transition-transform ${usernameDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {usernameDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-56 rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto top-full right-0">
                            <div className="py-1">
                                <button
                                    onClick={clearUsernameFilter}
                                    className={`block w-full text-left px-4 py-2 text-sm ${!usernameFilter ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    All Usernames
                                </button>
                                {userData?.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUsernameFilterSelect(user.user_name)}
                                        className={`block w-full text-left px-4 py-2 text-sm ${usernameFilter === user.user_name ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {user.user_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[calc(100vh-275px)] overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone No.</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {userData
                            ?.filter(user =>
                                user.user_name !== 'admin' &&
                                user.user_name !== 'DSMC' && (
                                    !usernameFilter || user.user_name.toLowerCase().includes(usernameFilter.toLowerCase()))
                            )
                            .map((user, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">{user?.user_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user?.email_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user?.number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user?.employee_id || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user?.user_access || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user?.status)}`}>
                                                {user?.status}
                                            </span>
                                            {user?.status === 'active' && (
                                                <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live Status"></span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user?.role)}`}>
                                            {user?.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditUser(user?.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;

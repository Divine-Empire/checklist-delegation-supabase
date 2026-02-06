import React, { useEffect } from 'react';
import { User, Building, Calendar, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import AdminLayout from '../components/layout/AdminLayout';
import { userDetails, departmentDetails, departmentOnlyDetails, givenByDetails } from '../redux/slice/settingSlice';

import useSettingUIStore from '../stores/useSettingUIStore';
import { useUserManagement } from '../hooks/useUserManagement';
import { useDepartmentManagement } from '../hooks/useDepartmentManagement';
import { useDeviceSync } from '../hooks/useDeviceSync';

import UserTable from '../components/admin/UserTable';
import DepartmentTable from '../components/admin/DepartmentTable';
import LeaveManagement from '../components/admin/LeaveManagement';
import UserModal from '../components/admin/modals/UserModal';
import DepartmentModal from '../components/admin/modals/DepartmentModal';

const Setting = () => {
  const dispatch = useDispatch();
  const { department } = useSelector((state) => state.setting);

  // UI Store
  const {
    activeTab, setActiveTab,
    setShowUserModal, setShowDeptModal,
    resetUserForm, resetDeptForm
  } = useSettingUIStore();

  // Hooks
  const { handleAddUser, handleUpdateUser } = useUserManagement();
  const { handleAddDepartment, handleUpdateDepartment } = useDepartmentManagement();

  // Mount & Sync Logic
  useDeviceSync();

  // Initial Fetch handled by useDeviceSync (which calls userDetails) but we might want explicit logic
  // Actually useDeviceSync handles polling but initial load of department needs a trigger?
  useEffect(() => {
    // We can keep specific fetch priority here if needed, or rely on tab switch logic
    dispatch(userDetails());
    dispatch(departmentDetails());
  }, [dispatch]);

  // Handle tab change
  const onTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users') {
      dispatch(userDetails());
      dispatch(departmentDetails());
    } else if (tab === 'departments') {
      dispatch(departmentOnlyDetails());
      dispatch(givenByDetails());
    } else if (tab === 'leave') {
      dispatch(userDetails());
    }
  };

  const handleAddButtonClick = () => {
    if (activeTab === 'users') {
      resetUserForm();
      setShowUserModal(true);
    } else if (activeTab === 'departments') {
      resetDeptForm();
      setShowDeptModal(true);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header and Tabs */}
        <div className="my-5 flex justify-between">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font bold text-purple-600 font-bold">User Management System</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex border border-purple-200 rounded-md overflow-hidden self-start">
              <button
                className={`flex px-4 py-3 text-sm font-medium ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                onClick={() => onTabChange('users')}
              >
                <User size={18} className="mr-2" />
                Users
              </button>
              <button
                className={`flex px-4 py-3 text-sm font-medium ${activeTab === 'departments' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                onClick={() => onTabChange('departments')}
              >
                <Building size={18} className="mr-2" />
                Departments
              </button>
              <button
                className={`flex px-4 py-3 text-sm font-medium ${activeTab === 'leave' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                onClick={() => onTabChange('leave')}
              >
                <Calendar size={18} className="mr-2" />
                Leave Management
              </button>
            </div>

            {activeTab !== 'leave' && (
              <button
                onClick={handleAddButtonClick}
                className="rounded-md gradient-bg py-2 px-4 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center">
                  <Plus size={18} className="mr-2" />
                  <span>{activeTab === 'users' ? 'Add User' : 'Add Department'}</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'users' && <UserTable />}
        {activeTab === 'departments' && <DepartmentTable />}
        {activeTab === 'leave' && <LeaveManagement />}

        {/* Modals */}
        <UserModal
          handleAddUser={handleAddUser}
          handleUpdateUser={handleUpdateUser}
          departmentList={department}
        />

        <DepartmentModal
          handleAddDepartment={handleAddDepartment}
          handleUpdateDepartment={handleUpdateDepartment}
        />
      </div>
    </AdminLayout>
  );
};

export default Setting;

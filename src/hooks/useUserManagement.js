import { useDispatch, useSelector } from 'react-redux';
import { createUser, updateUser, deleteUser, userDetails } from '../redux/slice/settingSlice';
import useSettingUIStore from '../stores/useSettingUIStore';

export const useUserManagement = () => {
    const dispatch = useDispatch();
    const {
        userForm, currentUserId,
        resetUserForm, setShowUserModal,
        setIsEditing, setCurrentUserId, setUserForm
    } = useSettingUIStore();

    const { userData } = useSelector((state) => state.setting);

    const handleAddUser = async (e) => {
        e.preventDefault();
        const newUser = {
            ...userForm,
            user_access: userForm.department,
        };

        try {
            console.log("Creating user with payload:", newUser);
            await dispatch(createUser(newUser)).unwrap();
            resetUserForm();
            setShowUserModal(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        const updatedUser = {
            user_name: userForm.username,
            password: userForm.password,
            email_id: userForm.email,
            number: userForm.phone,
            employee_id: userForm.employee_id,
            role: userForm.role,
            status: userForm.status,
            user_access: userForm.department
        };

        try {
            await dispatch(updateUser({ id: currentUserId, updatedUser })).unwrap();
            resetUserForm();
            setShowUserModal(false);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await dispatch(deleteUser(userId)).unwrap();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditUser = (userId) => {
        const user = userData.find(u => u.id === userId);
        if (!user) return;

        setUserForm({
            username: user.user_name,
            email: user.email_id,
            password: user.password,
            phone: user.number,
            employee_id: user.employee_id || '',
            department: user.user_access || '',
            role: user.role,
            status: user.status
        });
        setCurrentUserId(userId);
        setIsEditing(true);
        setShowUserModal(true);
    };

    return {
        handleAddUser,
        handleUpdateUser,
        handleDeleteUser,
        handleEditUser
    };
};

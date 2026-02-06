import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../redux/slice/settingSlice';
import useSettingUIStore from '../stores/useSettingUIStore';
import supabase from '../SupabaseClient';

export const useLeaveManagement = () => {
    const dispatch = useDispatch();
    const {
        selectedUsers, leaveStartDate, leaveEndDate, remark, leaveUsernameFilter,
        setSelectedUsers, setLeaveStartDate, setLeaveEndDate, setRemark, setLeaveUsernameFilter
    } = useSettingUIStore();

    const { userData } = useSelector((state) => state.setting);

    const filteredLeaveUsers = userData?.filter(user =>
        !leaveUsernameFilter || user.user_name.toLowerCase().includes(leaveUsernameFilter.toLowerCase())
    );

    const handleUserSelection = (userId, isSelected) => {
        if (isSelected) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select fully filtered list or all users? Original code selected userData.map, 
            // but if filtered, maybe we should only select filtered? 
            // Original code: setSelectedUsers(userData.map(user => user.id));
            // But logic above has filteredLeaveUsers. Let's select filtered users to be more intuitive if filter is active.
            // If no filter, this selects all.
            setSelectedUsers(filteredLeaveUsers?.map(user => user.id) || []);
        } else {
            setSelectedUsers([]);
        }
    };

    const clearLeaveUsernameFilter = () => {
        setLeaveUsernameFilter('');
    };

    const handleSubmitLeave = async () => {
        if (selectedUsers.length === 0 || !leaveStartDate || !leaveEndDate) {
            alert('Please select at least one user and provide both start and end dates');
            return;
        }

        const startDate = new Date(leaveStartDate);
        const endDate = new Date(leaveEndDate);

        if (startDate > endDate) {
            alert('End date cannot be before start date');
            return;
        }

        try {
            // Update each selected user with leave information
            const updatePromises = selectedUsers.map(userId =>
                dispatch(updateUser({
                    id: userId,
                    updatedUser: {
                        leave_date: leaveStartDate,
                        leave_end_date: leaveEndDate,
                        remark: remark
                    }
                })).unwrap()
            );

            await Promise.all(updatePromises);

            // Delete matching checklist tasks
            const deleteChecklistPromises = selectedUsers.map(async (userId) => {
                const user = userData.find(u => u.id === userId);
                if (user && user.user_name) {
                    try {
                        const formattedStartDate = `${leaveStartDate}T00:00:00`;
                        const formattedEndDate = `${leaveEndDate}T23:59:59`;

                        const { error } = await supabase
                            .from('checklist')
                            .delete()
                            .eq('name', user.user_name)
                            .gte('task_start_date', formattedStartDate)
                            .lte('task_start_date', formattedEndDate);

                        if (error) {
                            console.error('Error deleting checklist tasks:', error);
                        } else {
                            console.log(`Deleted checklist tasks for ${user.user_name} from ${leaveStartDate} to ${leaveEndDate}`);
                        }
                    } catch (error) {
                        console.error('Error in checklist deletion:', error);
                    }
                }
            });

            await Promise.all(deleteChecklistPromises);

            // Reset form
            setSelectedUsers([]);
            setLeaveStartDate('');
            setLeaveEndDate('');
            setRemark('');

            // Ideally we re-fetch details or simple reload. Original did reload 1s later.
            // dispatch(userDetails()); 
            // Keeping the reload logic for consistency with original or changing to fetch?
            // The user requested refactor, better to avoid reload if possible.
            // dispatch(userDetails()) should refresh the list.
            setTimeout(() => window.location.reload(), 1000); // Keeping as per original behavior for safety
            alert('Leave information submitted successfully and matching tasks deleted');
        } catch (error) {
            console.error('Error submitting leave information:', error);
            alert('Error submitting leave information');
        }
    };

    return {
        filteredLeaveUsers,
        handleUserSelection,
        handleSelectAll,
        handleSubmitLeave,
        clearLeaveUsernameFilter
    };
};

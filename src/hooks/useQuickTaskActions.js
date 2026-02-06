import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateChecklistTask,
    deleteChecklistTask,
    uniqueChecklistTaskData
} from '../redux/slice/quickTaskSlice';
import useQuickTaskUIStore from '../stores/useQuickTaskUIStore';

export const useQuickTaskActions = () => {
    const dispatch = useDispatch();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const { activeTab } = useQuickTaskUIStore();
    const { quickTask } = useSelector((state) => state.quickTask);

    const {
        editFormData, editingTaskId, cancelEditing,
        selectedTasks, clearSelection
    } = useQuickTaskUIStore();

    const handleSaveEdit = async () => {
        if (!editFormData.task_id) return;

        const originalTask = quickTask.find(task => task.task_id === editFormData.task_id);
        if (!originalTask) return;

        setIsSaving(true);
        setError(null);
        try {
            await dispatch(updateChecklistTask({
                updatedTask: editFormData,
                originalTask: {
                    department: originalTask.department,
                    name: originalTask.name,
                    task_description: originalTask.task_description
                }
            })).unwrap();

            cancelEditing();
            // Refresh data
            dispatch(uniqueChecklistTaskData({ page: 0, pageSize: 50, nameFilter: '' })); // Simplified refresh
        } catch (err) {
            console.error("Failed to update task:", err);
            setError("Failed to update task");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTasks.length === 0) return;

        setIsDeleting(true);
        setError(null);
        try {
            await dispatch(deleteChecklistTask(selectedTasks)).unwrap();
            clearSelection();
        } catch (err) {
            console.error("Failed to delete tasks:", err);
            setError("Failed to delete tasks");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSingle = async (task) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        setIsDeleting(true);
        setError(null);
        try {
            await dispatch(deleteChecklistTask([task])).unwrap();
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError("Failed to delete task");
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        handleSaveEdit,
        handleDeleteSelected,
        handleDeleteSingle,
        isSaving,
        isDeleting,
        error,
        setError
    };
};

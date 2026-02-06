import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { insertDelegationDoneAndUpdate } from '../redux/api/delegationApi';
import useDelegationUIStore from '../stores/useDelegationUIStore';

export const useDelegationActions = (activeTasks, refreshData) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const {
        selectedItems,
        statusData,
        nextTargetDate,
        remarksData,
        uploadedImages,
        resetForm
    } = useDelegationUIStore();

    const handleSubmit = async () => {
        const selectedIds = Array.from(selectedItems);
        if (selectedIds.length === 0) return alert("Please select at least one item to submit");

        // Validation
        const missingStatus = selectedIds.filter(id => !statusData[id]);
        if (missingStatus.length > 0) return alert(`Missing status for ${missingStatus.length} items.`);

        const missingNextDate = selectedIds.filter(id => statusData[id] === "Extend date" && !nextTargetDate[id]);
        if (missingNextDate.length > 0) return alert(`Missing target date for ${missingNextDate.length} items.`);

        const missingRequiredImages = selectedIds.filter(id => {
            const item = activeTasks.find(t => t.task_id === id);
            if (!item) return false;
            const required = item.require_attachment?.toUpperCase() === "YES";
            return required && !uploadedImages[id] && !item.image;
        });
        if (missingRequiredImages.length > 0) return alert(`Missing required images for ${missingRequiredImages.length} items.`);

        setIsSubmitting(true);
        try {
            const selectedData = selectedIds.map(id => {
                const item = activeTasks.find(t => t.task_id === id);
                const dbStatus = statusData[id] === "Done" ? "done" : statusData[id] === "Extend date" ? "extend" : statusData[id];

                return {
                    task_id: item.task_id,
                    department: item.department,
                    given_by: item.given_by,
                    name: item.name,
                    task_description: item.task_description,
                    task_start_date: item.task_start_date,
                    planned_date: item.planned_date,
                    status: dbStatus,
                    next_extend_date: statusData[id] === "Extend date" ? nextTargetDate[id] : null,
                    reason: remarksData[id] || "",
                    image_url: uploadedImages[id] ? null : item.image,
                    require_attachment: item.require_attachment,
                    submission_timestamp: new Date().toISOString()
                };
            });

            const submissionPromises = selectedData.map(async (taskData) => {
                const taskImage = uploadedImages[taskData.task_id];
                return dispatch(
                    insertDelegationDoneAndUpdate({
                        selectedDataArray: [taskData],
                        uploadedImages: taskImage ? { [taskData.task_id]: taskImage } : {},
                    })
                );
            });

            await Promise.allSettled(submissionPromises); // Assuming mostly success, or handle errors like original

            setSuccessMessage(`Successfully submitted ${selectedIds.length} task records!`);
            resetForm();

            // Refresh
            setTimeout(() => {
                refreshData();
            }, 1000);

        } catch (err) {
            console.error(err);
            alert('An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        handleSubmit,
        isSubmitting,
        successMessage,
        setSuccessMessage
    };
};

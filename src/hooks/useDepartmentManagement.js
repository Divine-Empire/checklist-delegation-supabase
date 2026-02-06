import { useDispatch, useSelector } from 'react-redux';
import { createDepartment, updateDepartment, departmentDetails, departmentOnlyDetails, givenByDetails } from '../redux/slice/settingSlice';
import useSettingUIStore from '../stores/useSettingUIStore';

export const useDepartmentManagement = () => {
    const dispatch = useDispatch();
    const {
        deptForm, currentDeptId,
        resetDeptForm, setShowDeptModal,
        setCurrentDeptId, setDeptForm
    } = useSettingUIStore();

    const { department } = useSelector((state) => state.setting);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        const newDept = { ...deptForm };

        try {
            await dispatch(createDepartment(newDept)).unwrap();
            resetDeptForm();
            setShowDeptModal(false);
        } catch (error) {
            console.error('Error adding department:', error);
        }
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        const updatedDept = {
            department: deptForm.name,
            given_by: deptForm.givenBy
        };

        try {
            await dispatch(updateDepartment({ id: currentDeptId, updatedDept })).unwrap();
            resetDeptForm();
            setShowDeptModal(false);
        } catch (error) {
            console.error('Error updating department:', error);
        }
    };

    const handleEditDepartment = (deptId) => {
        const dept = department.find(d => d.id === deptId);
        if (!dept) return;

        setDeptForm({
            name: dept.department,
            givenBy: dept.given_by
        });
        setCurrentDeptId(deptId);
        setShowDeptModal(true);
    };

    return {
        handleAddDepartment,
        handleUpdateDepartment,
        handleEditDepartment
    };
};

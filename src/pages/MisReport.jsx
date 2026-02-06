import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import MisReportHeader from '../components/misreport/MisReportHeader';
import StaffTable from '../components/misreport/StaffTable';
import { useMisReportData } from '../hooks/useMisReportData';

function StaffTasksPage() {
    const {
        filteredStaffMembers,
        staffMembers,
        availableStaff,
        isLoading,
        loadMore,
        hasMoreData,
        totalUsersCount,
        totalStaffCount
    } = useMisReportData();

    return (
        <AdminLayout>
            <div className="space-y-6">
                <MisReportHeader availableStaff={availableStaff} />
                <StaffTable
                    filteredStaffMembers={filteredStaffMembers}
                    staffMembers={staffMembers}
                    isLoading={isLoading}
                    loadMore={loadMore}
                    hasMoreData={hasMoreData}
                    totalUsersCount={totalUsersCount}
                    totalStaffCount={totalStaffCount}
                />
            </div>
        </AdminLayout>
    );
}

export default StaffTasksPage;
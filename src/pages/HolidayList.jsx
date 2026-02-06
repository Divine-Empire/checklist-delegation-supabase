import React, { useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import useHolidayStore from "../stores/useHolidayStore";
import { useHolidayManager } from "../hooks/useHolidayManager";
import { useWorkingDayManager } from "../hooks/useWorkingDayManager";
import HolidayTable from "../components/admin/HolidayTable";
import WorkingDayTable from "../components/admin/WorkingDayTable";

const HolidayList = () => {
    // Stores
    const {
        modalOpen, setModalOpen, formData, loading, editIndex, setFormData,
        showWorkingDays, setShowWorkingDays, workingDayLoading,
        workingDayModalOpen, setWorkingDayModalOpen, workingDayFormData, workingDayEditIndex
    } = useHolidayStore();

    // Hooks
    const {
        handleChange,
        handleSubmit,
        handleDelete: handleDeleteHoliday,
        handleEdit: handleEditHoliday
    } = useHolidayManager();

    const {
        handleWorkingDayChange,
        handleWorkingDaySubmit,
        handleWorkingDayDelete,
        handleWorkingDayEdit
    } = useWorkingDayManager();

    return (
        <AdminLayout>
            <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-purple-700">
                            🎉 Holiday List
                        </h1>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (showWorkingDays) {
                                        setShowWorkingDays(false);
                                    } else {
                                        setModalOpen(true);
                                    }
                                }}
                                disabled={loading}
                                className="rounded-md gradient-bg py-2 px-3 sm:px-4 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
                            >
                                {showWorkingDays ? 'Show Holiday List' : '+ Add Holiday'}
                            </button>
                            <button
                                onClick={() => setShowWorkingDays(!showWorkingDays)}
                                disabled={workingDayLoading}
                                className={`rounded-md py-2 px-3 sm:px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base ${showWorkingDays ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                + Working Days
                            </button>

                        </div>
                    </div>
                </div>

                {!showWorkingDays && (
                    <HolidayTable
                        handleDelete={handleDeleteHoliday}
                        handleEdit={handleEditHoliday}
                    />
                )}

                {modalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {editIndex !== null ? "Edit Holiday" : "Add Holiday"}
                                            </h3>
                                            <form onSubmit={handleSubmit}>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Day
                                                        </label>
                                                        <select
                                                            id="day"
                                                            name="day"
                                                            value={formData.day}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        >
                                                            <option value="">Select Day</option>
                                                            <option value="Monday">Monday</option>
                                                            <option value="Tuesday">Tuesday</option>
                                                            <option value="Wednesday">Wednesday</option>
                                                            <option value="Thursday">Thursday</option>
                                                            <option value="Friday">Friday</option>
                                                            <option value="Saturday">Saturday</option>
                                                            <option value="Sunday">Sunday</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="date"
                                                            name="date"
                                                            value={formData.date}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Holiday Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            placeholder="e.g., New Year, Christmas, Diwali"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                                    >
                                                        {loading
                                                            ? "Saving..."
                                                            : editIndex !== null
                                                                ? "Update"
                                                                : "Save"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ day: "", date: "", name: "" }); // Using store setFormData indirectly to reset or we can export reset from store
                                                            // Actually, useHolidayManager usually handles reset, but we are manually resetting here to close.
                                                            // For clean code, I should have exposed resetFormData from hooks or store to here.
                                                            setModalOpen(false);
                                                        }}
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showWorkingDays && (
                    <WorkingDayTable
                        setWorkingDayModalOpen={setWorkingDayModalOpen}
                        handleDelete={handleWorkingDayDelete}
                        handleEdit={handleWorkingDayEdit}
                    />
                )}

                {/* Working Day Modal */}
                {
                    workingDayModalOpen && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                    {workingDayEditIndex !== null ? "Edit Working Day" : "Add Working Day"}
                                                </h3>
                                                <form onSubmit={handleWorkingDaySubmit}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label htmlFor="working_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                                Working Date
                                                            </label>
                                                            <input
                                                                type="date"
                                                                id="working_date"
                                                                name="working_date"
                                                                value={workingDayFormData.working_date}
                                                                onChange={handleWorkingDayChange}
                                                                required
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                                                Day (Hindi)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="day"
                                                                name="day"
                                                                placeholder="e.g., शुक्रवार, शनिवार"
                                                                value={workingDayFormData.day}
                                                                onChange={handleWorkingDayChange}
                                                                required
                                                                readOnly
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-50"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={workingDayLoading}
                                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                                        >
                                                            {workingDayLoading
                                                                ? "Saving..."
                                                                : workingDayEditIndex !== null
                                                                    ? "Update"
                                                                    : "Save"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setWorkingDayModalOpen(false);
                                                                // Should also reset form ideally
                                                            }}
                                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </AdminLayout>
    );
};

export default HolidayList;
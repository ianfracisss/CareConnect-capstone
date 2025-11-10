"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getPSGAvailability,
  createPSGAvailability,
  updatePSGAvailability,
  deletePSGAvailability,
} from "@/actions/psg-availability";
import { useAlert } from "@/components/AlertProvider";
import type { PSGAvailability, DayOfWeek } from "@/types/appointments";
import { DAY_NAMES } from "@/types/appointments";

export default function PSGAvailabilityPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [userId, setUserId] = useState<string>("");
  const [availabilities, setAvailabilities] = useState<PSGAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1); // Monday
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const loadAvailability = async () => {
    try {
      // Get current user from localStorage or API
      const user = localStorage.getItem("userId");
      if (!user) {
        showAlert({
          message: "Please login first",
          type: "error",
          duration: 5000,
        });
        router.push("/login");
        return;
      }

      setUserId(user);
      const result = await getPSGAvailability(user);

      if (result.success && result.data) {
        setAvailabilities(result.data);
      } else {
        showAlert({
          message: result.error || "Failed to load availability",
          type: "error",
          duration: 5000,
        });
      }
    } catch {
      showAlert({
        message: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (endTime <= startTime) {
      showAlert({
        message: "End time must be after start time",
        type: "error",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing
        const result = await updatePSGAvailability(editingId, {
          day_of_week: selectedDay,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
        });

        if (result.success) {
          showAlert({
            message: "Availability updated successfully",
            type: "success",
            duration: 5000,
          });
          setEditingId(null);
          setShowForm(false);
        } else {
          showAlert({
            message: result.error || "Failed to update availability",
            type: "error",
            duration: 5000,
          });
        }
      } else {
        // Create new
        const result = await createPSGAvailability({
          psg_member_id: userId,
          day_of_week: selectedDay,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_active: true,
        });

        if (result.success) {
          showAlert({
            message: "Availability added successfully",
            type: "success",
            duration: 5000,
          });
          setShowForm(false);
        } else {
          showAlert({
            message: result.error || "Failed to add availability",
            type: "error",
            duration: 5000,
          });
        }
      }

      await loadAvailability();
      resetForm();
    } catch {
      showAlert({
        message: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (availability: PSGAvailability) => {
    setEditingId(availability.id);
    setSelectedDay(availability.day_of_week);
    setStartTime(availability.start_time.substring(0, 5));
    setEndTime(availability.end_time.substring(0, 5));
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability?")) return;

    try {
      setLoading(true);
      const result = await deletePSGAvailability(id);

      if (result.success) {
        showAlert({
          message: "Availability deleted successfully",
          type: "success",
          duration: 5000,
        });
        await loadAvailability();
      } else {
        showAlert({
          message: result.error || "Failed to delete availability",
          type: "error",
          duration: 5000,
        });
      }
    } catch {
      showAlert({
        message: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDay(1);
    setStartTime("09:00");
    setEndTime("17:00");
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading && availabilities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Availability</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Add Availability
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Availability" : "Add Availability"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Day of Week</label>
              <select
                value={selectedDay}
                onChange={(e) =>
                  setSelectedDay(Number(e.target.value) as DayOfWeek)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              >
                {Object.entries(DAY_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Availability List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Schedule</h2>

        {availabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>
              No availability set yet. Add your first time slot to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-lg">
                    {DAY_NAMES[availability.day_of_week]}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {availability.start_time.substring(0, 5)} -{" "}
                    {availability.end_time.substring(0, 5)}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                      availability.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {availability.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(availability)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(availability.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

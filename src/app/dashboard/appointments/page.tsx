"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStudentAppointments } from "@/actions/appointments";
import { useAlert } from "@/components/AlertProvider";
import type {
  AppointmentWithProfiles,
  AppointmentStatus,
} from "@/types/appointments";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/types/appointments";

export default function StudentAppointmentsPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [appointments, setAppointments] = useState<AppointmentWithProfiles[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const loadAppointments = async () => {
    try {
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

      const result = await getStudentAppointments(user);

      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        showAlert({
          message: result.error || "Failed to load appointments",
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
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();

    if (filter === "upcoming") {
      return (
        aptDate >= now &&
        apt.status !== "completed" &&
        apt.status !== "cancelled"
      );
    } else if (filter === "past") {
      return (
        aptDate < now ||
        apt.status === "completed" ||
        apt.status === "cancelled"
      );
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Link
          href="/dashboard/appointments/book"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(["all", "upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-3 font-medium transition-colors capitalize ${
              filter === tab
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No appointments found</p>
            <Link
              href="/dashboard/appointments/book"
              className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {apt.psg_member.full_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        APPOINTMENT_STATUS_COLORS[
                          apt.status as AppointmentStatus
                        ]
                      }`}
                    >
                      {
                        APPOINTMENT_STATUS_LABELS[
                          apt.status as AppointmentStatus
                        ]
                      }
                    </span>
                  </div>

                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(apt.appointment_date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatTime(apt.appointment_date)} ({apt.duration_minutes}{" "}
                      minutes)
                    </p>
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {apt.location_type === "online" ? "Online" : "In Person"}
                    </p>
                  </div>

                  {apt.notes && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {apt.notes}
                      </p>
                    </div>
                  )}

                  {apt.cancellation_reason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                        Cancellation Reason:
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {apt.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href={`/dashboard/appointments/${apt.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

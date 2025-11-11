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
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointments";
import { createClient } from "@/lib/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Loader } from "@/components/Loader";

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
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        showAlert({
          message: "Please login first",
          type: "error",
          duration: 5000,
        });
        router.push("/login");
        return;
      }

      const result = await getStudentAppointments(user.id);

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
    return <Loader fullScreen text="Loading appointments..." />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar
        subtitle="View and manage your appointments"
        showHomeButton={true}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>
            My Appointments
          </h1>
          <Link
            href="/dashboard/appointments/book"
            className="px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--bg-dark)",
            }}
          >
            Book New Appointment
          </Link>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex gap-2 mb-6 border-b"
          style={{ borderColor: "var(--border-muted)" }}
        >
          {(["all", "upcoming", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-6 py-3 font-medium transition-colors capitalize"
              style={{
                borderBottom:
                  filter === tab ? "2px solid var(--primary)" : "none",
                color: filter === tab ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div
              className="rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.015)] p-8 text-center"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <p className="mb-4" style={{ color: "var(--text-muted)" }}>
                No appointments found
              </p>
              <Link
                href="/dashboard/appointments/book"
                className="inline-block px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                style={{
                  background: "var(--primary)",
                  color: "var(--bg-dark)",
                }}
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.015)] p-6 hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.03),0_4px_8px_rgba(0,0,0,0.02)] transition-shadow"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border-muted)",
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-base font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {apt.psg_member.full_name}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                        style={{
                          background:
                            apt.status === "scheduled"
                              ? "var(--warning)"
                              : apt.status === "confirmed"
                              ? "var(--info)"
                              : apt.status === "completed"
                              ? "var(--success)"
                              : "var(--error)",
                          color: "var(--bg-dark)",
                        }}
                      >
                        {
                          APPOINTMENT_STATUS_LABELS[
                            apt.status as AppointmentStatus
                          ]
                        }
                      </span>
                    </div>

                    <div
                      className="space-y-1"
                      style={{ color: "var(--text-muted)" }}
                    >
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
                        {formatTime(apt.appointment_date)} (
                        {apt.duration_minutes} minutes)
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
                        {apt.location_type === "online"
                          ? "Online"
                          : "In Person"}
                      </p>
                    </div>

                    {apt.notes && (
                      <div
                        className="mt-3 p-3 rounded-lg"
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border-muted)",
                        }}
                      >
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          Notes:
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {apt.notes}
                        </p>
                      </div>
                    )}

                    {apt.cancellation_reason && (
                      <div
                        className="mt-3 p-3 rounded-lg"
                        style={{
                          background: "var(--error-bg)",
                          border: "1px solid var(--error)",
                        }}
                      >
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: "var(--error)" }}
                        >
                          Cancellation Reason:
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--error)" }}
                        >
                          {apt.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/appointments/${apt.id}`}
                    className="px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.08)] hover:opacity-90 transition-all"
                    style={{
                      background: "var(--info)",
                      color: "var(--bg-dark)",
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

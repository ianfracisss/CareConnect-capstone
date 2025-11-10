"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPSGAppointments, confirmAppointment } from "@/actions/appointments";
import { useAlert } from "@/components/AlertProvider";
import type {
  AppointmentWithProfiles,
  AppointmentStatus,
} from "@/types/appointments";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointments";
import { createClient } from "@/lib/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Loader } from "@/components/Loader";
import { CheckCircle, Calendar, Clock, MapPin, User } from "lucide-react";

export default function PSGAppointmentsPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [appointments, setAppointments] = useState<AppointmentWithProfiles[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "upcoming" | "past">(
    "pending"
  );

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

      const result = await getPSGAppointments(user.id);

      if (result.success && result.data) {
        setAppointments(result.data);

        // Auto-switch to upcoming tab if no pending appointments
        const hasPending = result.data.some(
          (apt) => apt.status === "scheduled"
        );
        if (!hasPending && filter === "pending") {
          setFilter("upcoming");
        }
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

  const handleConfirm = async (appointmentId: string) => {
    try {
      setConfirming(appointmentId);
      const result = await confirmAppointment(appointmentId);

      if (result.success) {
        showAlert({
          message: "Appointment confirmed successfully!",
          type: "success",
          duration: 5000,
        });
        await loadAppointments();
      } else {
        showAlert({
          message: result.error || "Failed to confirm appointment",
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
      setConfirming(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();

    if (filter === "pending") {
      return apt.status === "scheduled";
    } else if (filter === "upcoming") {
      return (
        aptDate >= now &&
        (apt.status === "confirmed" || apt.status === "scheduled")
      );
    } else if (filter === "past") {
      return (
        aptDate < now ||
        apt.status === "completed" ||
        apt.status === "cancelled"
      );
    }
    return true; // all
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled":
        return "var(--warning)";
      case "confirmed":
        return "var(--info)";
      case "completed":
        return "var(--success)";
      case "cancelled":
      case "no_show":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading appointments..." />;
  }

  const pendingCount = appointments.filter(
    (apt) => apt.status === "scheduled"
  ).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar
        subtitle="View and manage your scheduled appointments"
        showHomeButton={true}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text)" }}
            >
              My Appointments
            </h1>
            {pendingCount > 0 && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                You have {pendingCount} pending appointment
                {pendingCount !== 1 ? "s" : ""} to confirm
              </p>
            )}
          </div>
          <Link
            href="/dashboard/psg/availability"
            className="px-6 py-2 rounded-lg hover:opacity-90 transition-all"
            style={{ background: "var(--primary)", color: "var(--bg-dark)" }}
          >
            Manage Availability
          </Link>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex gap-4 mb-6 border-b pb-2"
          style={{ borderColor: "var(--border-muted)" }}
        >
          {[
            { key: "pending" as const, label: "Pending", count: pendingCount },
            { key: "upcoming" as const, label: "Upcoming" },
            { key: "past" as const, label: "Past" },
            { key: "all" as const, label: "All" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-2 font-medium transition-all relative"
              style={{
                borderBottom:
                  filter === tab.key ? "2px solid var(--primary)" : "none",
                color:
                  filter === tab.key ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 text-xs rounded-full"
                  style={{
                    background: "var(--error)",
                    color: "var(--bg-dark)",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div
              className="text-center py-12 rounded-lg"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <Calendar
                size={48}
                className="mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-lg font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                No appointments found
              </p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border-muted)",
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User size={20} style={{ color: "var(--text-muted)" }} />
                      <h3
                        className="text-xl font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {apt.student.full_name}
                      </h3>
                      {apt.student.school_id && (
                        <span
                          className="text-sm px-2 py-1 rounded"
                          style={{
                            background: "var(--bg-secondary)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {apt.student.school_id}
                        </span>
                      )}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium ml-auto"
                        style={{
                          background: getStatusColor(apt.status),
                          color: "var(--bg-dark)",
                        }}
                      >
                        {APPOINTMENT_STATUS_LABELS[apt.status]}
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{formatDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>
                          {formatTime(apt.appointment_date)} (
                          {apt.duration_minutes} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        <span className="capitalize">{apt.location_type}</span>
                      </div>
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
                          Student Notes:
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
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/dashboard/psg/appointments/${apt.id}`}
                    className="px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                    style={{
                      background: "var(--info)",
                      color: "var(--bg-dark)",
                    }}
                  >
                    View Details
                  </Link>
                  {apt.status === "scheduled" && (
                    <button
                      onClick={() => handleConfirm(apt.id)}
                      disabled={confirming === apt.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                      style={{
                        background: "var(--success)",
                        color: "var(--bg-dark)",
                      }}
                    >
                      <CheckCircle size={18} />
                      {confirming === apt.id
                        ? "Confirming..."
                        : "Confirm Appointment"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

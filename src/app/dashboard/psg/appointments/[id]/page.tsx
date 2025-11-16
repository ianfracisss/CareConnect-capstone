"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from "@/actions/appointments";
import { getSessionByAppointmentId } from "@/actions/sessions";
import { useAlert } from "@/components/AlertProvider";
import type { AppointmentWithProfiles } from "@/types/appointments";
import type { SessionWithAppointment } from "@/types/sessions";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointments";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Loader } from "@/components/Loader";
import { SessionDocumentationForm } from "@/components/SessionDocumentationForm";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PSGAppointmentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showAlert } = useAlert();
  const [appointment, setAppointment] =
    useState<AppointmentWithProfiles | null>(null);
  const [session, setSession] = useState<SessionWithAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    async function load() {
      await loadAppointment();
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const loadAppointment = async () => {
    try {
      const [appointmentResult, sessionResult] = await Promise.all([
        getAppointmentById(resolvedParams.id),
        getSessionByAppointmentId(resolvedParams.id),
      ]);

      if (appointmentResult.success && appointmentResult.data) {
        setAppointment(appointmentResult.data);
      } else {
        showAlert({
          message: appointmentResult.error || "Failed to load appointment",
          type: "error",
          duration: 5000,
        });
        router.push("/dashboard/psg/appointments");
      }

      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
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

  const handleConfirm = async () => {
    try {
      setProcessing(true);
      const result = await confirmAppointment(resolvedParams.id);

      if (result.success) {
        showAlert({
          message: "Appointment confirmed successfully!",
          type: "success",
          duration: 5000,
        });
        await loadAppointment();
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
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    try {
      setProcessing(true);
      const result = await completeAppointment(
        resolvedParams.id,
        completionNotes.trim() || undefined
      );

      if (result.success) {
        showAlert({
          message: "Appointment marked as completed successfully!",
          type: "success",
          duration: 5000,
        });
        await loadAppointment();
        setShowCompleteDialog(false);
        setCompletionNotes("");
      } else {
        showAlert({
          message: result.error || "Failed to complete appointment",
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
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showAlert({
        message: "Please provide a reason for cancellation",
        type: "error",
        duration: 5000,
      });
      return;
    }

    try {
      setProcessing(true);
      const result = await cancelAppointment(resolvedParams.id, cancelReason);

      if (result.success) {
        showAlert({
          message: "Appointment cancelled successfully",
          type: "success",
          duration: 5000,
        });
        await loadAppointment();
        setShowCancelDialog(false);
        setCancelReason("");
      } else {
        showAlert({
          message: result.error || "Failed to cancel appointment",
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
      setProcessing(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "var(--warning)";
      case "confirmed":
        return "var(--info)";
      case "completed":
        return "var(--success)";
      default:
        return "var(--error)";
    }
  };

  const canConfirm =
    appointment &&
    appointment.status === "scheduled" &&
    new Date(appointment.appointment_date) > new Date();

  const canComplete =
    appointment &&
    appointment.status === "confirmed" &&
    appointment.status !== "completed" &&
    appointment.status !== "cancelled";

  const canCancel =
    appointment &&
    appointment.status !== "cancelled" &&
    appointment.status !== "completed" &&
    new Date(appointment.appointment_date) > new Date();

  const canDocumentSession =
    appointment &&
    (appointment.status === "completed" ||
      new Date(appointment.appointment_date) < new Date());

  const hasSession = session !== null;

  if (loading) {
    return <Loader fullScreen text="Loading appointment details..." />;
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar
        subtitle="Appointment details and actions"
        showHomeButton={true}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/psg/appointments"
            className="flex items-center gap-2 hover:underline"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={20} />
            Back to Appointments
          </Link>
        </div>

        {/* Main Card */}
        <div
          className="rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.015)] p-8"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              Appointment Details
            </h1>
            <span
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: getStatusColor(appointment.status),
                color: "var(--bg-dark)",
              }}
            >
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </span>
          </div>

          {/* Student Information */}
          <div className="mb-8">
            <h2
              className="text-base font-bold mb-4 flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <User size={20} />
              Student Information
            </h2>
            <div
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-muted)",
              }}
            >
              {appointment.student.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appointment.student.avatar_url}
                  alt={appointment.student.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <p
                  className="font-semibold text-lg"
                  style={{ color: "var(--text)" }}
                >
                  {appointment.student.full_name}
                </p>
                {appointment.student.school_id && (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Student ID: {appointment.student.school_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div className="mb-8">
            <h2
              className="text-base font-bold mb-4"
              style={{ color: "var(--text)" }}
            >
              Appointment Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar
                  size={24}
                  className="mt-1"
                  style={{ color: "var(--text-muted)" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Date
                  </p>
                  <p
                    className="text-lg font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {formatDate(appointment.appointment_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  size={24}
                  className="mt-1"
                  style={{ color: "var(--text-muted)" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Time
                  </p>
                  <p
                    className="text-lg font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {formatTime(appointment.appointment_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  size={24}
                  className="mt-1"
                  style={{ color: "var(--text-muted)" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Duration
                  </p>
                  <p
                    className="text-lg font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {appointment.duration_minutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={24}
                  className="mt-1"
                  style={{ color: "var(--text-muted)" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Location
                  </p>
                  <p
                    className="text-lg font-medium capitalize"
                    style={{ color: "var(--text)" }}
                  >
                    {appointment.location_type}
                  </p>
                </div>
              </div>

              {appointment.meeting_link && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={24}
                    className="mt-1"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Meeting Link
                    </p>
                    <a
                      href={appointment.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Notes */}
          {appointment.notes && (
            <div className="mb-8">
              <h2
                className="text-base font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                Student Notes
              </h2>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border-muted)",
                }}
              >
                <p style={{ color: "var(--text)" }}>{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {appointment.cancellation_reason && (
            <div className="mb-8">
              <h2
                className="text-base font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                Cancellation Details
              </h2>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "var(--error-bg)",
                  border: "1px solid var(--error)",
                }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancelled on:{" "}
                  {appointment.cancelled_at
                    ? formatDate(appointment.cancelled_at)
                    : "N/A"}
                </p>
                <p style={{ color: "var(--error)" }}>
                  {appointment.cancellation_reason}
                </p>
              </div>
            </div>
          )}

          {/* Session Documentation Section */}
          {canDocumentSession && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-base font-bold flex items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  <FileText size={20} />
                  Session Documentation
                </h2>
                {!hasSession && !showSessionForm && (
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                    style={{
                      background: "var(--primary-20)",
                      color: "var(--primary)",
                    }}
                  >
                    <Plus size={16} />
                    Add Documentation
                  </button>
                )}
              </div>

              {hasSession && !showSessionForm ? (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-muted)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Clock size={20} style={{ color: "var(--text-muted)" }} />
                    <p style={{ color: "var(--text)" }}>
                      <span className="font-semibold">Duration:</span>{" "}
                      {session.duration_minutes || 0} minutes
                    </p>
                  </div>
                  <div className="mb-3">
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Notes:
                    </p>
                    <p
                      className="text-sm line-clamp-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {session.notes || "No notes available"}
                    </p>
                  </div>
                  {session.feedback && (
                    <div className="mb-3">
                      <p
                        className="text-sm font-semibold mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Feedback:
                      </p>
                      <p
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {session.feedback}
                      </p>
                    </div>
                  )}
                  <div
                    className="flex gap-2 pt-3 border-t"
                    style={{ borderColor: "var(--border-muted)" }}
                  >
                    <Link
                      href={`/dashboard/psg/sessions/${session.id}`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        background: "var(--primary-20)",
                        color: "var(--primary)",
                      }}
                    >
                      View Full Details
                    </Link>
                    <button
                      onClick={() => setShowSessionForm(true)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        background: "var(--bg-light)",
                        border: "1px solid var(--border-muted)",
                        color: "var(--text)",
                      }}
                    >
                      Edit Documentation
                    </button>
                  </div>
                </div>
              ) : showSessionForm ? (
                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-muted)",
                  }}
                >
                  <SessionDocumentationForm
                    appointmentId={resolvedParams.id}
                    existingSession={session || undefined}
                    onSuccess={() => {
                      setShowSessionForm(false);
                      loadAppointment();
                    }}
                    onCancel={() => setShowSessionForm(false)}
                  />
                </div>
              ) : (
                <div
                  className="p-8 rounded-lg text-center"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-muted)",
                  }}
                >
                  <FileText
                    size={48}
                    className="mx-auto mb-3"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No session documentation yet
                  </p>
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="px-6 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      background: "var(--primary)",
                      color: "var(--text-inverse)",
                    }}
                  >
                    Add Documentation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {canConfirm && (
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 font-medium"
                style={{
                  background: "var(--success)",
                  color: "var(--bg-dark)",
                }}
              >
                <CheckCircle size={20} />
                {processing ? "Confirming..." : "Confirm Appointment"}
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => setShowCompleteDialog(true)}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 font-medium"
                style={{
                  background: "var(--success)",
                  color: "var(--bg-dark)",
                }}
              >
                <CheckCircle size={20} />
                Mark as Completed
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 font-medium"
                style={{ background: "var(--error)", color: "var(--bg-dark)" }}
              >
                <XCircle size={20} />
                Cancel Appointment
              </button>
            )}
          </div>
        </div>

        {/* Complete Dialog */}
        {showCompleteDialog && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <h3
                className="text-base font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                Mark Appointment as Completed
              </h3>
              <p className="mb-4" style={{ color: "var(--text-muted)" }}>
                You can optionally add completion notes:
              </p>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about the appointment... (optional)"
                rows={4}
                className="w-full px-4 py-2 rounded-lg resize-none mb-4"
                style={{
                  border: "1px solid var(--border-muted)",
                  background: "var(--bg)",
                  color: "var(--text)",
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleComplete}
                  disabled={processing}
                  className="flex-1 px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  style={{
                    background: "var(--success)",
                    color: "var(--bg-dark)",
                  }}
                >
                  {processing ? "Processing..." : "Mark as Completed"}
                </button>
                <button
                  onClick={() => {
                    setShowCompleteDialog(false);
                    setCompletionNotes("");
                  }}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.08)] hover:opacity-90 transition-all"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Dialog */}
        {showCancelDialog && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <h3
                className="text-base font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                Cancel Appointment
              </h3>
              <p className="mb-4" style={{ color: "var(--text-muted)" }}>
                Please provide a reason for cancelling this appointment:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg resize-none mb-4"
                style={{
                  border: "1px solid var(--border-muted)",
                  background: "var(--bg)",
                  color: "var(--text)",
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="flex-1 px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  style={{
                    background: "var(--error)",
                    color: "var(--bg-dark)",
                  }}
                >
                  {processing ? "Cancelling..." : "Confirm Cancel"}
                </button>
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason("");
                  }}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.08)] hover:opacity-90 transition-all"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text)",
                  }}
                >
                  Keep Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

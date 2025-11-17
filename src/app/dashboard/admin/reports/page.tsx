"use client";

import { useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAppointmentReports,
  getReferralReports,
  getSessionReports,
  getUsageReport,
} from "@/actions/admin";
import { useAlert } from "@/components/AlertProvider";
import type {
  AppointmentReport,
  ReferralReport,
  SessionReport,
  UsageReport,
} from "@/types/admin";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Loader } from "@/components/Loader";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  Activity,
  Download,
  Filter,
} from "lucide-react";

type ReportTab = "appointments" | "referrals" | "sessions" | "usage";

export default function ReportsPage() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<ReportTab>("appointments");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [appointmentReports, setAppointmentReports] = useState<
    AppointmentReport[]
  >([]);
  const [referralReports, setReferralReports] = useState<ReferralReport[]>([]);
  const [sessionReports, setSessionReports] = useState<SessionReport[]>([]);
  const [usageReport, setUsageReport] = useState<UsageReport | null>(null);

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      showAlert({
        message: "Please select both start and end dates",
        type: "error",
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    try {
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      if (activeTab === "appointments") {
        const result = await getAppointmentReports(filters);
        if (result.success && result.data) {
          setAppointmentReports(result.data);
        } else {
          showAlert({
            message: result.error || "Failed to generate report",
            type: "error",
            duration: 5000,
          });
        }
      } else if (activeTab === "referrals") {
        const result = await getReferralReports(filters);
        if (result.success && result.data) {
          setReferralReports(result.data);
        } else {
          showAlert({
            message: result.error || "Failed to generate report",
            type: "error",
            duration: 5000,
          });
        }
      } else if (activeTab === "sessions") {
        const result = await getSessionReports(filters);
        if (result.success && result.data) {
          setSessionReports(result.data);
        } else {
          showAlert({
            message: result.error || "Failed to generate report",
            type: "error",
            duration: 5000,
          });
        }
      } else if (activeTab === "usage") {
        const result = await getUsageReport(
          dateRange.startDate,
          dateRange.endDate
        );
        if (result.success && result.data) {
          setUsageReport(result.data);
        } else {
          showAlert({
            message: result.error || "Failed to generate report",
            type: "error",
            duration: 5000,
          });
        }
      }

      showAlert({
        message: "Report generated successfully!",
        type: "success",
        duration: 5000,
      });
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

  const handleExport = () => {
    let data: unknown[] = [];
    let filename = "";

    if (activeTab === "appointments") {
      data = appointmentReports;
      filename = `appointments_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    } else if (activeTab === "referrals") {
      data = referralReports;
      filename = `referrals_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    } else if (activeTab === "sessions") {
      data = sessionReports;
      filename = `sessions_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    } else if (activeTab === "usage") {
      data = usageReport ? [usageReport] : [];
      filename = `usage_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert({
      message: "Report exported successfully!",
      type: "success",
      duration: 5000,
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40, 150, 80);
    doc.text("CareConnect", 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Mental Health Referral System", 14, 22);

    // Add title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const reportTitle = `${
      activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    } Report`;
    doc.text(reportTitle, 14, 35);

    // Add date range
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Period: ${new Date(
        dateRange.startDate
      ).toLocaleDateString()} - ${new Date(
        dateRange.endDate
      ).toLocaleDateString()}`,
      14,
      42
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

    let startY = 55;

    if (activeTab === "appointments" && appointmentReports.length > 0) {
      // Summary stats
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Summary", 14, startY);
      startY += 7;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${appointmentReports.length}`, 14, startY);
      doc.text(
        `Completed: ${
          appointmentReports.filter((a) => a.status === "completed").length
        }`,
        60,
        startY
      );
      doc.text(
        `Scheduled: ${
          appointmentReports.filter((a) => a.status === "scheduled").length
        }`,
        110,
        startY
      );
      doc.text(
        `Cancelled: ${
          appointmentReports.filter((a) => a.status === "cancelled").length
        }`,
        160,
        startY
      );
      startY += 10;

      // Table
      autoTable(doc, {
        startY,
        head: [["Date", "Student", "PSG Member", "Status"]],
        body: appointmentReports.map((apt) => [
          new Date(apt.appointment_date).toLocaleString(),
          apt.student_name,
          apt.psg_member_name,
          apt.status.toUpperCase(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [40, 150, 80] },
        styles: { fontSize: 9 },
      });
    } else if (activeTab === "referrals" && referralReports.length > 0) {
      // Summary stats
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Summary", 14, startY);
      startY += 7;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${referralReports.length}`, 14, startY);
      doc.text(
        `Completed: ${
          referralReports.filter((r) => r.status === "completed").length
        }`,
        60,
        startY
      );
      doc.text(
        `In Progress: ${
          referralReports.filter((r) => r.status === "in_progress").length
        }`,
        110,
        startY
      );
      doc.text(
        `Escalated: ${
          referralReports.filter((r) => r.status === "escalated").length
        }`,
        160,
        startY
      );
      startY += 10;

      // Table
      autoTable(doc, {
        startY,
        head: [["Date", "Student", "Source", "Severity", "Status"]],
        body: referralReports.map((ref) => [
          new Date(ref.created_at).toLocaleDateString(),
          ref.student_name,
          ref.source.replace("_", " ").toUpperCase(),
          ref.severity.toUpperCase(),
          ref.status.replace("_", " ").toUpperCase(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [40, 150, 80] },
        styles: { fontSize: 9 },
      });
    } else if (activeTab === "sessions" && sessionReports.length > 0) {
      // Summary stats
      const totalDuration = sessionReports.reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );
      const avgDuration =
        sessionReports.length > 0
          ? Math.round(totalDuration / sessionReports.length)
          : 0;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Summary", 14, startY);
      startY += 7;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total Sessions: ${sessionReports.length}`, 14, startY);
      doc.text(`Total Duration: ${totalDuration} min`, 80, startY);
      doc.text(`Avg Duration: ${avgDuration} min`, 150, startY);
      startY += 10;

      // Table
      autoTable(doc, {
        startY,
        head: [["Date", "Student", "PSG Member", "Duration (min)"]],
        body: sessionReports.map((session) => [
          new Date(session.created_at).toLocaleDateString(),
          session.student_name,
          session.psg_member_name,
          (session.duration_minutes || "N/A").toString(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [40, 150, 80] },
        styles: { fontSize: 9 },
      });
    } else if (activeTab === "usage" && usageReport) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Usage Statistics", 14, startY);
      startY += 10;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      const stats = [
        ["Active Students", usageReport.active_students.toString()],
        ["Active PSG Members", usageReport.active_psg_members.toString()],
        ["Total Appointments", usageReport.total_appointments.toString()],
        [
          "Completed Appointments",
          usageReport.completed_appointments.toString(),
        ],
        [
          "Cancelled Appointments",
          usageReport.cancelled_appointments.toString(),
        ],
        ["Total Referrals", usageReport.total_referrals.toString()],
        ["Total Sessions", usageReport.total_sessions.toString()],
        ["Total Users (New)", usageReport.total_users.toString()],
      ];

      autoTable(doc, {
        startY,
        head: [["Metric", "Value"]],
        body: stats,
        theme: "grid",
        headStyles: { fillColor: [40, 150, 80] },
        styles: { fontSize: 10 },
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "CareConnect - Confidential Report",
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Save PDF
    const filename = `${activeTab}_report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
    doc.save(filename);

    showAlert({
      message: "PDF downloaded successfully!",
      type: "success",
      duration: 5000,
    });
  };

  const tabs = [
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "referrals", label: "Referrals", icon: FileText },
    { id: "sessions", label: "Sessions", icon: Users },
    { id: "usage", label: "Usage", icon: Activity },
  ];

  const hasData =
    (activeTab === "appointments" && appointmentReports.length > 0) ||
    (activeTab === "referrals" && referralReports.length > 0) ||
    (activeTab === "sessions" && sessionReports.length > 0) ||
    (activeTab === "usage" && usageReport !== null);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar subtitle="System reports and analytics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 transition-colors"
          style={{ color: "var(--primary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Reports & Analytics
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Generate and export system reports
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-2 mb-6 p-1 rounded-lg"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "var(--bg-dark)" : "var(--text-muted)",
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div
          className="p-6 rounded-lg mb-6"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>
              Report Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  border: "1px solid var(--border-muted)",
                  background: "var(--bg)",
                  color: "var(--text)",
                }}
              />
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  border: "1px solid var(--border-muted)",
                  background: "var(--bg)",
                  color: "var(--text)",
                }}
              />
            </div>

            {activeTab !== "usage" && (
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "var(--text)" }}
                >
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    border: "1px solid var(--border-muted)",
                    background: "var(--bg)",
                    color: "var(--text)",
                  }}
                >
                  <option value="all">All Statuses</option>
                  {activeTab === "appointments" && (
                    <>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </>
                  )}
                  {activeTab === "referrals" && (
                    <>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="escalated">Escalated</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading || !dateRange.startDate || !dateRange.endDate}
            className="px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            style={{
              background: "var(--primary)",
              color: "var(--bg-dark)",
            }}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {/* Report Content */}
        {loading ? (
          <Loader text="Generating report..." />
        ) : hasData ? (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "var(--bg-light)",
              border: "1px solid var(--border-muted)",
            }}
          >
            <div
              className="flex items-center justify-between p-4"
              style={{
                borderBottom: "1px solid var(--border-muted)",
              }}
            >
              <h3 className="font-semibold" style={{ color: "var(--text)" }}>
                Report Results
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                  style={{
                    background: "var(--primary-20)",
                    color: "var(--primary)",
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                  style={{
                    background: "var(--success-20)",
                    color: "var(--success)",
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Appointments Report */}
              {activeTab === "appointments" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Appointments
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {appointmentReports.length}
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Completed
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--success)" }}
                      >
                        {
                          appointmentReports.filter(
                            (a) => a.status === "completed"
                          ).length
                        }
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Scheduled
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {
                          appointmentReports.filter(
                            (a) => a.status === "scheduled"
                          ).length
                        }
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancelled
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--error)" }}
                      >
                        {
                          appointmentReports.filter(
                            (a) => a.status === "cancelled"
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-muted)",
                          }}
                        >
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Date
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Student
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            PSG Member
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentReports.map((apt) => (
                          <tr
                            key={apt.id}
                            style={{
                              borderBottom: "1px solid var(--border-muted)",
                            }}
                          >
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {new Date(apt.appointment_date).toLocaleString()}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {apt.student_name}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {apt.psg_member_name}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  background:
                                    apt.status === "completed"
                                      ? "var(--success-20)"
                                      : apt.status === "scheduled"
                                      ? "var(--primary-20)"
                                      : "var(--error-20)",
                                  color:
                                    apt.status === "completed"
                                      ? "var(--success)"
                                      : apt.status === "scheduled"
                                      ? "var(--primary)"
                                      : "var(--error)",
                                }}
                              >
                                {apt.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Referrals Report */}
              {activeTab === "referrals" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Referrals
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {referralReports.length}
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Completed
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--success)" }}
                      >
                        {
                          referralReports.filter(
                            (r) => r.status === "completed"
                          ).length
                        }
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        In Progress
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {
                          referralReports.filter(
                            (r) => r.status === "in_progress"
                          ).length
                        }
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Escalated
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--error)" }}
                      >
                        {
                          referralReports.filter(
                            (r) => r.status === "escalated"
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-muted)",
                          }}
                        >
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Date
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Student
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Source
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Severity
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {referralReports.map((ref) => (
                          <tr
                            key={ref.id}
                            style={{
                              borderBottom: "1px solid var(--border-muted)",
                            }}
                          >
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {new Date(ref.created_at).toLocaleDateString()}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {ref.student_name}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {ref.source.replace("_", " ").toUpperCase()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  background:
                                    ref.severity === "high"
                                      ? "var(--error-20)"
                                      : ref.severity === "medium"
                                      ? "var(--warning-20)"
                                      : "var(--success-20)",
                                  color:
                                    ref.severity === "high"
                                      ? "var(--error)"
                                      : ref.severity === "medium"
                                      ? "var(--warning)"
                                      : "var(--success)",
                                }}
                              >
                                {ref.severity.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  background:
                                    ref.status === "completed"
                                      ? "var(--success-20)"
                                      : ref.status === "in_progress"
                                      ? "var(--primary-20)"
                                      : "var(--text-muted)",
                                  color:
                                    ref.status === "completed"
                                      ? "var(--success)"
                                      : ref.status === "in_progress"
                                      ? "var(--primary)"
                                      : "var(--text)",
                                }}
                              >
                                {ref.status.replace("_", " ").toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sessions Report */}
              {activeTab === "sessions" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Sessions
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {sessionReports.length}
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Duration
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {sessionReports.reduce(
                          (sum, s) => sum + (s.duration_minutes || 0),
                          0
                        )}{" "}
                        min
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Avg Duration
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--success)" }}
                      >
                        {sessionReports.length > 0
                          ? Math.round(
                              sessionReports.reduce(
                                (sum, s) => sum + (s.duration_minutes || 0),
                                0
                              ) / sessionReports.length
                            )
                          : 0}{" "}
                        min
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-muted)",
                          }}
                        >
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Date
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Student
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            PSG Member
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium uppercase"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionReports.map((session) => (
                          <tr
                            key={session.id}
                            style={{
                              borderBottom: "1px solid var(--border-muted)",
                            }}
                          >
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {new Date(
                                session.created_at
                              ).toLocaleDateString()}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {session.student_name}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {session.psg_member_name}
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{ color: "var(--text)" }}
                            >
                              {session.duration_minutes || "N/A"} min
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Usage Report */}
              {activeTab === "usage" && usageReport && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Active Students
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {usageReport.active_students}
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Active PSG Members
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {usageReport.active_psg_members}
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg)" }}
                    >
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Interactions
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--success)" }}
                      >
                        {usageReport.total_appointments +
                          usageReport.total_referrals}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-lg"
                    style={{ background: "var(--bg)" }}
                  >
                    <h4
                      className="font-semibold mb-4"
                      style={{ color: "var(--text)" }}
                    >
                      Detailed Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total Appointments
                        </p>
                        <p
                          className="text-xl font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {usageReport.total_appointments}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total Referrals
                        </p>
                        <p
                          className="text-xl font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {usageReport.total_referrals}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total Sessions
                        </p>
                        <p
                          className="text-xl font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {usageReport.total_sessions}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Report Period
                        </p>
                        <p
                          className="text-xl font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
                          {new Date(dateRange.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="rounded-lg p-12 text-center"
            style={{
              background: "var(--bg-light)",
              border: "1px solid var(--border-muted)",
            }}
          >
            <FileText
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text)" }}
            >
              No Report Generated
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              Select a date range and click Generate Report to view data
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

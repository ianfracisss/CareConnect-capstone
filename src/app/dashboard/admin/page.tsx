import { getUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { getSystemStats } from "@/actions/admin";
import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  ClipboardList,
  TrendingUp,
  Shield,
  BarChart3,
  Settings,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const statsResult = await getSystemStats();
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar subtitle="System Administration & Management" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage users, view reports, and monitor system activity
          </p>
        </div>

        {/* System Statistics */}
        {stats && (
          <>
            <div className="mb-8">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                System Overview
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Users
                        className="w-5 h-5"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {stats.total_users}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Users
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: "var(--border-muted)" }}
                  >
                    <div
                      className="flex justify-between text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span>Students: {stats.total_students}</span>
                      <span>PSG: {stats.total_psg_members}</span>
                      <span>Admins: {stats.total_admins}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "var(--success-20)" }}
                    >
                      <Calendar
                        className="w-5 h-5"
                        style={{ color: "var(--success)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {stats.total_appointments}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Appointments
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: "var(--border-muted)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      This Month: {stats.appointments_this_month}
                    </p>
                  </div>
                </div>

                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "var(--warning-20)" }}
                    >
                      <ClipboardList
                        className="w-5 h-5"
                        style={{ color: "var(--warning)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {stats.total_referrals}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Referrals
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: "var(--border-muted)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      This Month: {stats.referrals_this_month}
                    </p>
                  </div>
                </div>

                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "var(--info-20)" }}
                    >
                      <FileText
                        className="w-5 h-5"
                        style={{ color: "var(--info)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {stats.total_sessions}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total Sessions
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: "var(--border-muted)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      This Month: {stats.sessions_this_month}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2
            className="text-lg font-bold mb-4"
            style={{ color: "var(--text)" }}
          >
            Administrative Functions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/admin/users"
              className="p-6 rounded-lg hover:shadow-md transition-all"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--primary-20)" }}
                >
                  <Users
                    className="w-6 h-6"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    User Management
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Manage user accounts, roles, and permissions
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/reports"
              className="p-6 rounded-lg hover:shadow-md transition-all"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--success-20)" }}
                >
                  <BarChart3
                    className="w-6 h-6"
                    style={{ color: "var(--success)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    Reports & Analytics
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    View system usage and generate reports
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/audit"
              className="p-6 rounded-lg hover:shadow-md transition-all"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--warning-20)" }}
                >
                  <Shield
                    className="w-6 h-6"
                    style={{ color: "var(--warning)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    Audit Logs
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Track system activity and user actions
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/appointments"
              className="p-6 rounded-lg hover:shadow-md transition-all"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--info-20)" }}
                >
                  <Calendar
                    className="w-6 h-6"
                    style={{ color: "var(--info)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    All Appointments
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    View and manage all system appointments
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/referrals"
              className="p-6 rounded-lg hover:shadow-md transition-all"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--error-20)" }}
                >
                  <ClipboardList
                    className="w-6 h-6"
                    style={{ color: "var(--error)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    All Referrals
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    View and manage all system referrals
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/sessions"
              className="p-6 rounded-lg hover:shadow-md transition-all"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--success-20)" }}
                >
                  <FileText
                    className="w-6 h-6"
                    style={{ color: "var(--success)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    All Sessions
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    View all session documentation
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div
          className="p-6 rounded-lg"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp
              className="w-6 h-6"
              style={{ color: "var(--success)" }}
            />
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              System Status
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Database Connection
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: "var(--success-20)",
                  color: "var(--success)",
                }}
              >
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Authentication Service
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: "var(--success-20)",
                  color: "var(--success)",
                }}
              >
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Real-time Services
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: "var(--success-20)",
                  color: "var(--success)",
                }}
              >
                Operational
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

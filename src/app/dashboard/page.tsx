import { getUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { formatRole } from "@/lib/utils/auth";
import { DashboardClientWrapper } from "@/components/DashboardClientWrapper";
import { getSystemStats } from "@/actions/admin";
import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch system stats for admin users
  const statsResult = user.role === "admin" ? await getSystemStats() : null;
  const stats = statsResult?.success ? statsResult.data : null;

  return (
    // Restyle Dashboard Page on every role
    <DashboardClientWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <DashboardNavbar subtitle={`Welcome back, ${user.full_name}`} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-10">
            <div
              className="rounded-lg p-4"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--info)" }}>
                <span className="font-semibold">Role:</span>{" "}
                {formatRole(user.role)}
              </p>
              {user.school_id && (
                <p className="text-sm mt-1" style={{ color: "var(--info)" }}>
                  <span className="font-semibold">School ID:</span>{" "}
                  {user.school_id}
                </p>
              )}
            </div>
          </div>

          {/* Welcome Banner for Students */}
          {user.role === "student" && (
            <div className="mb-8 w-full">
              <div
                className="rounded-lg w-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-20) 0%, var(--primary-10) 100%)",
                  border: "1px solid var(--primary-30)",
                }}
              >
                <h2
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ color: "var(--primary)" }}
                >
                  Your Mental Health Matters
                </h2>
                <p
                  className="text-base md:text-lg mb-4 leading-relaxed"
                  style={{ color: "var(--text)" }}
                >
                  We&apos;re here to support you with confidential screenings,
                  peer support, and professional guidance.
                </p>
              </div>
            </div>
          )}

          {/* Welcome Banner for Admin */}
          {user.role === "admin" && (
            <div className="mb-8 w-full">
              <div
                className="rounded-lg  w-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-20) 0%, var(--primary-10) 100%)",
                  border: "1px solid var(--primary-30)",
                }}
              >
                <h2
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ color: "var(--primary)" }}
                >
                  Admin Dashboard
                </h2>
                <p
                  className="text-base md:text-lg mb-4 leading-relaxed"
                  style={{ color: "var(--text)" }}
                >
                  Manage the CareConnect system, monitor user activity, and
                  ensure the mental health support system runs smoothly for all
                  students and PSG members.
                </p>
              </div>
            </div>
          )}

          {/* Welcome Banner for PSG Members */}
          {user.role === "psg_member" && (
            <div className="mb-8 w-full">
              <div
                className="rounded-lg  w-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-20) 0%, var(--primary-10) 100%)",
                  border: "1px solid var(--primary-30)",
                }}
              >
                <h2
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ color: "var(--primary)" }}
                >
                  Welcome, PSG Member
                </h2>
                <p
                  className="text-base md:text-lg mb-4 leading-relaxed"
                  style={{ color: "var(--text)" }}
                >
                  Thank you for being part of the Peer Support Group. Your role
                  is vital in providing mental health support to fellow students
                  through active listening, guidance, and compassionate care.
                </p>
              </div>
            </div>
          )}

          {/* System Overview - Admin Only */}
          {user.role === "admin" && stats && (
            <div className="mb-8">
              <h2
                className="text-base font-bold mb-6"
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
          )}

          <div>
            <h2
              className="text-base font-bold mb-6"
              style={{ color: "var(--text)" }}
            >
              {user.role === "admin"
                ? "Administrative Functions"
                : user.role === "student"
                ? "Get Started - Choose What You Need"
                : "Quick Access"}
            </h2>
            {/* Student Info Section */}
            {user.role === "student" && null}
            {/* Admin Info Section */}
            {user.role === "admin" && (
              <div className="mb-6">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  Monitor system health, manage user accounts, and access
                  comprehensive reports. Use <strong>User Management</strong> to
                  control access, <strong>Reports & Analytics</strong> for
                  insights, and <strong>Audit Logs</strong> to track system
                  activities.
                </p>
              </div>
            )}
            {/* PSG Info Section */}
            {user.role === "psg_member" && (
              <div className="mb-6">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  Start by reviewing <strong>My Appointments</strong> to see
                  upcoming sessions, or update your{" "}
                  <strong>Availability</strong> to let students know when
                  you&apos;re free. Don&apos;t forget to document completed
                  sessions for proper record-keeping.
                </p>
              </div>
            )}{" "}
            {/* Student Dashboard */}
            {user.role === "student" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Mental Health Screening - Active */}
                <Link
                  href="/dashboard/screening/take"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <ClipboardList
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Mental Health Screening
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Take a confidential mental health assessment
                      </p>
                    </div>
                  </div>
                </Link>

                {/* View Results - Active */}
                <Link
                  href="/dashboard/screening/results"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <TrendingUp
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        View Results
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Check your screening results and recommendations
                      </p>
                    </div>
                  </div>
                </Link>

                {/* My Appointments - Active */}
                <Link
                  href="/dashboard/appointments"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Calendar
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        My Appointments
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Schedule sessions with PSG members
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Self-Referral Form - Active */}
                <Link
                  href="/dashboard/referrals/create"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <FileText
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Self-Referral Form
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Submit a referral request for support
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {/* Mental Health Tips Section - Students Only */}
            {user.role === "student" && (
              <div className="mt-10">
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--text)" }}
                >
                  💡 Quick Mental Health Tips
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "var(--bg-light)",
                      border: "1px solid var(--border-muted)",
                    }}
                  >
                    <div className="text-3xl mb-2">🧘</div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Practice Mindfulness
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Take 5 minutes daily for deep breathing or meditation
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "var(--bg-light)",
                      border: "1px solid var(--border-muted)",
                    }}
                  >
                    <div className="text-3xl mb-2">🏃</div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Stay Active
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Regular exercise boosts mood and reduces stress
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "var(--bg-light)",
                      border: "1px solid var(--border-muted)",
                    }}
                  >
                    <div className="text-3xl mb-2">💬</div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Talk It Out
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Share your feelings with trusted friends or counselors
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "var(--bg-light)",
                      border: "1px solid var(--border-muted)",
                    }}
                  >
                    <div className="text-3xl mb-2">😴</div>
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Prioritize Sleep
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Aim for 7-9 hours of quality sleep each night
                    </p>
                  </div>
                </div>

                {/* Important Note */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    background: "var(--warning-10)",
                    border: "1px solid var(--warning-30)",
                  }}
                >
                  <p
                    className="text-sm flex items-start gap-2"
                    style={{ color: "var(--text)" }}
                  >
                    <span className="text-lg">⚠️</span>
                    <span>
                      <strong>Emergency:</strong> If you are in crisis, contact
                      the National Mental Health Crisis Hotline at{" "}
                      <strong>1553</strong> or visit the OCCS office
                      immediately. Help is available 24/7.
                    </span>
                  </p>
                </div>
              </div>
            )}
            {/* PSG Member Dashboard */}
            {user.role === "psg_member" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Review Screenings - Active */}
                <Link
                  href="/dashboard/psg/screenings"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <ClipboardList
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Review Screenings
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Review student mental health screenings
                      </p>
                    </div>
                  </div>
                </Link>

                {/* My Appointments - Active */}
                <Link
                  href="/dashboard/psg/appointments"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Calendar
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        My Appointments
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View and confirm scheduled sessions
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Manage Availability - Active */}
                <Link
                  href="/dashboard/psg/availability"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Calendar
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Manage Availability
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Set your weekly schedule
                      </p>
                    </div>
                  </div>
                </Link>

                {/* View Referrals - Active */}
                <Link
                  href="/dashboard/psg/referrals"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
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
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        View Referrals
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Manage assigned student referrals
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Session Documentation - Active */}
                <Link
                  href="/dashboard/psg/sessions"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <FileText
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Session Documentation
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Document and review session records
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {/* Admin Dashboard */}
            {user.role === "admin" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* User Management - Active */}
                <Link
                  href="/dashboard/admin/users"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
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
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        User Management
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Manage users, roles, and permissions
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Reports & Analytics - Active */}
                <Link
                  href="/dashboard/admin/reports"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <BarChart3
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Reports & Analytics
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View system analytics and reports
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Audit Logs - Active */}
                <Link
                  href="/dashboard/admin/audit"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Shield
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Audit Logs
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Review system activity logs
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Review Screenings - Active */}
                <Link
                  href="/dashboard/psg/screenings"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <ClipboardList
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Review Screenings
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Review student mental health screenings
                      </p>
                    </div>
                  </div>
                </Link>

                {/* All Appointments - Active */}
                <Link
                  href="/dashboard/psg/appointments"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Calendar
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        All Appointments
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View and manage all appointments
                      </p>
                    </div>
                  </div>
                </Link>

                {/* All Referrals - Active */}
                <Link
                  href="/dashboard/psg/referrals"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
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
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        All Referrals
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View and manage all referrals
                      </p>
                    </div>
                  </div>
                </Link>

                {/* All Sessions - Active */}
                <Link
                  href="/dashboard/psg/sessions"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <FileText
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        All Sessions
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View all session documentation
                      </p>
                    </div>
                  </div>
                </Link>

                {/* My Availability - Active */}
                <Link
                  href="/dashboard/psg/availability"
                  className="group rounded-lg p-6 transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--primary-20)" }}
                    >
                      <Calendar
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        My Availability
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Set your weekly schedule
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  );
}

import { getUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { formatRole } from "@/lib/utils/auth";
import { DashboardClientWrapper } from "@/components/DashboardClientWrapper";
import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // Restyle Dashboard Page on every role
    <DashboardClientWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <DashboardNavbar subtitle={`Welcome back, ${user.full_name}`} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
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

          <div>
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: "var(--text)" }}
            >
              Quick Access
            </h2>

            {/* Student Dashboard */}
            {user.role === "student" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Mental Health Screening - Active */}
                <Link
                  href="/dashboard/screening/take"
                  className="group rounded-lg p-6 transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
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
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Take a confidential mental health assessment
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--primary-20)",
                          color: "var(--primary)",
                        }}
                      >
                        Available Now
                      </span>
                    </div>
                  </div>
                </Link>

                {/* View Results - Active */}
                <Link
                  href="/dashboard/screening/results"
                  className="group rounded-lg p-6 transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
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
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Check your screening results and recommendations
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--primary-20)",
                          color: "var(--primary)",
                        }}
                      >
                        Available Now
                      </span>
                    </div>
                  </div>
                </Link>

                {/* My Appointments - Active */}
                <Link
                  href="/dashboard/appointments"
                  className="group rounded-lg p-6 transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
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
                        Schedule sessions with PSG members
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--primary-20)",
                          color: "var(--primary)",
                        }}
                      >
                        Available Now
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Coming Soon Cards - Last */}
                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <FileText
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
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
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Submit a referral request for support
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <MessageSquare
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Message PSG Members
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Chat with peer support group members
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PSG Member Dashboard */}
            {user.role === "psg_member" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Review Screenings - Active */}
                <Link
                  href="/dashboard/psg/screenings"
                  className="group rounded-lg p-6 transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
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
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--primary-20)",
                          color: "var(--primary)",
                        }}
                      >
                        Available Now
                      </span>
                    </div>
                  </div>
                </Link>

                {/* My Appointments - Active */}
                <Link
                  href="/dashboard/psg/appointments"
                  className="group rounded-lg p-6 transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
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
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--primary-20)",
                          color: "var(--primary)",
                        }}
                      >
                        Available Now
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Manage Availability - Active */}
                <Link
                  href="/dashboard/psg/availability"
                  className="group rounded-lg p-6 transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-light)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
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
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--primary-20)",
                          color: "var(--primary)",
                        }}
                      >
                        Available Now
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Coming Soon for PSG - Last */}
                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <Users
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
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
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Dashboard */}
            {user.role === "admin" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <Users
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
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
                        Manage users and permissions
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <BarChart3
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        Analytics Dashboard
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View system analytics and reports
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <Shield
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
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
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg p-6 opacity-60"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow: "0 2px 16px 0 var(--border-muted)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <Settings
                        className="w-6 h-6"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        System Settings
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Configure system preferences
                      </p>
                      <span
                        className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  );
}

import { getUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { formatRole } from "@/lib/utils/auth";
import { DashboardClientWrapper } from "@/components/DashboardClientWrapper";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // Restyle Dashboard Page on every role
    <DashboardClientWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Header */}
        <header
          style={{
            background: "var(--bg-dark)",
            boxShadow: "0 2px 16px 0 var(--border-muted)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--primary)" }}
              >
                CareConnect
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Welcome back, {user.full_name}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

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

          <div
            className="rounded-lg p-6"
            style={{
              background: "var(--bg-light)",
              boxShadow: "0 2px 16px 0 var(--border-muted)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text)" }}
            >
              Dashboard
            </h2>
            <p style={{ color: "var(--text-muted)" }}>
              This is your {formatRole(user.role).toLowerCase()} dashboard. The
              following features will be available soon:
            </p>
            <ul
              className="mt-4 space-y-2"
              style={{ color: "var(--text-muted)" }}
            >
              {user.role === "student" && (
                <>
                  <li>• Mental Health Screening</li>
                  <li>• Self-Referral Form</li>
                  <li>• Book Appointments</li>
                  <li>• Message PSG Members</li>
                  <li>• View Your Progress</li>
                </>
              )}
              {user.role === "psg_member" && (
                <>
                  <li>• View Assigned Referrals</li>
                  <li>• Manage Appointments</li>
                  <li>• Session Notes & Feedback</li>
                  <li>• Student Messaging</li>
                  <li>• Availability Management</li>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <li>• User Management</li>
                  <li>• System Reports</li>
                  <li>• Audit Logs</li>
                  <li>• Analytics Dashboard</li>
                  <li>• Configuration Settings</li>
                </>
              )}
            </ul>
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  );
}

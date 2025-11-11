import { DashboardNavbar } from "@/components/DashboardNavbar";
import { getStudentReferrals } from "@/actions/referrals";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import Link from "next/link";
import { FileText } from "lucide-react";
import {
  REFERRAL_STATUS_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  ReferralStatus,
} from "@/types/referrals";

// Utility functions
const getStatusColor = (status: ReferralStatus): string => {
  const colors: Record<ReferralStatus, string> = {
    pending: "var(--warning)",
    reviewed: "var(--info)",
    assigned: "var(--primary)",
    in_progress: "var(--primary)",
    completed: "var(--success)",
    escalated: "var(--error)",
  };
  return colors[status];
};

export default async function StudentReferralsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "student") {
    redirect("/dashboard");
  }

  const result = await getStudentReferrals(user.id);
  const referrals = result.success ? result.data || [] : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar subtitle="My Referrals" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-lg font-bold mb-1"
              style={{ color: "var(--text)" }}
            >
              My Referrals
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Track your support requests and their status
            </p>
          </div>
          <Link
            href="/dashboard/referrals/create"
            className="px-4 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "white",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
            }}
          >
            New Referral
          </Link>
        </div>

        {/* Referrals List */}
        {referrals.length === 0 ? (
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
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: "var(--text)" }}
            >
              No Referrals Yet
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              You haven&apos;t submitted any referrals yet.
            </p>
            <Link
              href="/dashboard/referrals/create"
              className="inline-block px-4 py-2 rounded-md text-sm font-medium"
              style={{
                background: "var(--primary)",
                color: "white",
              }}
            >
              Submit Your First Referral
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => {
              const statusColor = getStatusColor(referral.status);
              const severityColor = referral.severity
                ? SEVERITY_COLORS[referral.severity]
                : null;

              return (
                <Link
                  key={referral.id}
                  href={`/dashboard/referrals/${referral.id}`}
                  className="block rounded-lg p-6 transition-all hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  style={{
                    background: "var(--bg-light)",
                    border: "1px solid var(--border-muted)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.015)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded"
                          style={{
                            background: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {REFERRAL_STATUS_LABELS[referral.status]}
                        </span>
                        {severityColor && referral.severity && (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={{
                              background: `${severityColor}20`,
                              color: severityColor,
                            }}
                          >
                            {SEVERITY_LABELS[referral.severity]}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        {referral.reason}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Submitted on{" "}
                        {new Date(referral.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {referral.assigned_psg_member && (
                    <div
                      className="pt-4 mt-4 text-xs"
                      style={{
                        borderTop: "1px solid var(--border-muted)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <strong>Assigned PSG Member:</strong>{" "}
                      {referral.assigned_psg_member.full_name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

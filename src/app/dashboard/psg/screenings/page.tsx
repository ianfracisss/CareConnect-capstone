"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardClientWrapper } from "@/components/DashboardClientWrapper";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { AlertCircle, CheckCircle, Clock, Eye } from "lucide-react";
import { ScreeningResult } from "@/lib/types/screening";

// Mock data - in production, fetch from Supabase
const mockScreenings: ScreeningResult[] = [
  {
    id: "1",
    user_id: "student-1",
    total_score: 85,
    severity_score: 85,
    color_code: "red",
    recommendations: null,
    requires_immediate_attention: true,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    user_id: "student-2",
    total_score: 55,
    severity_score: 55,
    color_code: "yellow",
    recommendations: null,
    requires_immediate_attention: false,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    user_id: "student-3",
    total_score: 25,
    severity_score: 25,
    color_code: "green",
    recommendations: null,
    requires_immediate_attention: false,
    reviewed_by: "psg-member-1",
    reviewed_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

export default function PSGScreeningsPage() {
  const [screenings] = useState<ScreeningResult[]>(mockScreenings);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const router = useRouter();

  const filteredScreenings = screenings.filter((s) => {
    if (filter === "pending") return !s.reviewed_at;
    if (filter === "reviewed") return !!s.reviewed_at;
    return true;
  });

  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    // Sort by: unreviewed first, then by severity (high to low), then by date (newest first)
    if (!a.reviewed_at && b.reviewed_at) return -1;
    if (a.reviewed_at && !b.reviewed_at) return 1;

    // Sort by severity_score (higher scores first)
    const severityDiff = b.severity_score - a.severity_score;
    if (severityDiff !== 0) return severityDiff;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pendingCount = screenings.filter((s) => !s.reviewed_at).length;
  const highRiskCount = screenings.filter(
    (s) => s.severity_score >= 70 && !s.reviewed_at
  ).length;
  const reviewedCount = screenings.filter((s) => !!s.reviewed_at).length;

  const getSeverityBadge = (severityScore: number, colorCode: string) => {
    const getSeverityLabel = (score: number) => {
      if (score >= 70) return "HIGH";
      if (score >= 40) return "MODERATE";
      return "LOW";
    };

    const getBadgeColor = (code: string) => {
      switch (code) {
        case "red":
          return {
            bg: "var(--error-20)",
            color: "var(--error)",
            border: "var(--error)",
          };
        case "yellow":
          return {
            bg: "var(--warning-20)",
            color: "var(--warning)",
            border: "var(--warning)",
          };
        default:
          return {
            bg: "var(--success-20)",
            color: "var(--success)",
            border: "var(--success)",
          };
      }
    };

    const colors = getBadgeColor(colorCode);

    return (
      <span
        className="inline-block text-xs font-semibold px-2 py-1 rounded"
        style={{
          background: colors.bg,
          color: colors.color,
          border: `1px solid ${colors.border}`,
        }}
      >
        {getSeverityLabel(severityScore)}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <DashboardClientWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <DashboardNavbar subtitle="PSG Member Portal" showHomeButton={true} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                Student Screenings
              </h1>
              <p style={{ color: "var(--text-muted)" }}>
                Review and manage student mental health screening results
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div
                className="rounded-lg p-6"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border-muted)",
                  boxShadow: "0 2px 16px 0 var(--border-muted)",
                }}
              >
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    Pending Reviews
                  </h3>
                  <Clock
                    className="h-4 w-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {pendingCount}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Awaiting your review
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg p-6"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border-muted)",
                  boxShadow: "0 2px 16px 0 var(--border-muted)",
                }}
              >
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    High Risk Cases
                  </h3>
                  <AlertCircle
                    className="h-4 w-4"
                    style={{ color: "var(--error)" }}
                  />
                </div>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {highRiskCount}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Require immediate attention
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg p-6"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border-muted)",
                  boxShadow: "0 2px 16px 0 var(--border-muted)",
                }}
              >
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    Total Reviewed
                  </h3>
                  <CheckCircle
                    className="h-4 w-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {reviewedCount}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Completed reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Screenings List */}
            <div
              className="rounded-lg"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
                boxShadow: "0 2px 16px 0 var(--border-muted)",
              }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--border-muted)" }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Screening Results
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Click on a screening to view details and take action
                </p>
              </div>

              <div className="p-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setFilter("all")}
                    className="px-4 py-2 rounded-md text-sm font-medium transition"
                    style={{
                      background:
                        filter === "all"
                          ? "var(--primary)"
                          : "var(--bg-secondary)",
                      color:
                        filter === "all"
                          ? "var(--bg-dark)"
                          : "var(--text-muted)",
                    }}
                  >
                    All ({screenings.length})
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className="px-4 py-2 rounded-md text-sm font-medium transition"
                    style={{
                      background:
                        filter === "pending"
                          ? "var(--primary)"
                          : "var(--bg-secondary)",
                      color:
                        filter === "pending"
                          ? "var(--bg-dark)"
                          : "var(--text-muted)",
                    }}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilter("reviewed")}
                    className="px-4 py-2 rounded-md text-sm font-medium transition"
                    style={{
                      background:
                        filter === "reviewed"
                          ? "var(--primary)"
                          : "var(--bg-secondary)",
                      color:
                        filter === "reviewed"
                          ? "var(--bg-dark)"
                          : "var(--text-muted)",
                    }}
                  >
                    Reviewed ({reviewedCount})
                  </button>
                </div>

                {/* Screenings List */}
                <div className="space-y-3">
                  {sortedScreenings.length === 0 ? (
                    <div
                      className="text-center py-12"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No screenings found
                    </div>
                  ) : (
                    sortedScreenings.map((screening) => (
                      <div
                        key={screening.id}
                        className="rounded-lg p-4 border transition hover:bg-accent"
                        style={{
                          background: "var(--bg)",
                          borderColor: "var(--border-muted)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-medium"
                                style={{ color: "var(--text)" }}
                              >
                                Student #nt-{screening.user_id.slice(-1)}
                              </span>
                              {getSeverityBadge(
                                screening.severity_score,
                                screening.color_code
                              )}
                              {!screening.reviewed_at && (
                                <span
                                  className="inline-block text-xs font-semibold px-2 py-1 rounded border"
                                  style={{
                                    background: "var(--primary-20)",
                                    color: "var(--primary)",
                                    borderColor: "var(--primary)",
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                            <div
                              className="flex items-center gap-4 text-sm flex-wrap"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <span>Score: {screening.total_score}%</span>
                              <span>•</span>
                              <span>{formatTimeAgo(screening.created_at)}</span>
                              {screening.reviewed_at && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Reviewed
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/psg/screenings/${screening.id}`
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition border hover:bg-accent"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text)",
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  );
}

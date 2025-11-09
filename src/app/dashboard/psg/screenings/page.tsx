"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const getSeverityBadge = (severityScore: number, colorCode: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary"> = {
      red: "destructive",
      yellow: "default",
      green: "secondary",
    };

    const getSeverityLabel = (score: number) => {
      if (score >= 70) return "HIGH";
      if (score >= 40) return "MODERATE";
      return "LOW";
    };

    return (
      <Badge variant={variants[colorCode] || "default"}>
        {getSeverityLabel(severityScore)}
      </Badge>
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
    <div className="container max-w-7xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Student Screenings
        </h1>
        <p className="text-muted-foreground">
          Review and manage student mental health screening results
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Cases
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reviewed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {screenings.filter((s) => !!s.reviewed_at).length}
            </div>
            <p className="text-xs text-muted-foreground">Completed reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Screenings List */}
      <Card>
        <CardHeader>
          <CardTitle>Screening Results</CardTitle>
          <CardDescription>
            Click on a screening to view details and take action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            onValueChange={(v: string) => setFilter(v as typeof filter)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({screenings.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="reviewed">
                Reviewed ({screenings.filter((s) => !!s.reviewed_at).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-3">
              {sortedScreenings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No screenings found
                </div>
              ) : (
                sortedScreenings.map((screening) => (
                  <Card
                    key={screening.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Student #{screening.user_id.slice(-4)}
                            </span>
                            {getSeverityBadge(
                              screening.severity_score,
                              screening.color_code
                            )}
                            {!screening.reviewed_at && (
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                              >
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/psg/screenings/${screening.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

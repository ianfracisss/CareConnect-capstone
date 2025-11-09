"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardClientWrapper } from "@/components/DashboardClientWrapper";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { ScreeningResultDisplay } from "@/components/screening/ScreeningResultDisplay";
import { ScreeningResult } from "@/lib/types/screening";
import { MessageSquare, Calendar, RotateCcw } from "lucide-react";

export default function ScreeningResultsPage() {
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCaseAssessment, setHasCaseAssessment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load screening result from sessionStorage
    const storedResult = sessionStorage.getItem("screeningResult");
    const caseAssessmentStatus = sessionStorage.getItem("hasCaseAssessment");

    if (!storedResult) {
      // No result found, redirect back to take screening
      router.push("/dashboard/screening/take");
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult) as ScreeningResult;
      setResult(parsedResult);

      // Check if case assessment was already started
      if (caseAssessmentStatus === "true") {
        setHasCaseAssessment(true);
      }
    } catch {
      // Invalid result, redirect back
      router.push("/dashboard/screening/take");
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleStartCaseAssessment = () => {
    // Mark that user has started case assessment
    setHasCaseAssessment(true);
    sessionStorage.setItem("hasCaseAssessment", "true");

    // TODO: Navigate to case assessment chat when implemented
    // For now, show alert that case assessment has been initiated
    alert(
      "Case assessment initiated. A PSG member will reach out to you soon."
    );
  };

  const handleTakeAnother = () => {
    // Clear the stored result and case assessment flag
    sessionStorage.removeItem("screeningResult");
    sessionStorage.removeItem("hasCaseAssessment");
    router.push("/dashboard/screening/take");
  };

  if (isLoading) {
    return (
      <DashboardClientWrapper>
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
          <DashboardNavbar showHomeButton={true} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
              className="p-8 text-center rounded-xl border shadow"
              style={{
                background: "var(--bg-light)",
                borderColor: "var(--border-muted)",
              }}
            >
              <p style={{ color: "var(--text-muted)" }}>
                Loading your results...
              </p>
            </div>
          </main>
        </div>
      </DashboardClientWrapper>
    );
  }

  if (!result) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardClientWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <DashboardNavbar showHomeButton={true} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Centered Header Above Card */}
            <div className="max-w-3xl mx-auto flex flex-col items-center mb-2">
              <h1
                className="text-2xl font-bold tracking-tight text-center"
                style={{ color: "var(--text)" }}
              >
                Screening Results
              </h1>
              <p
                className="text-sm text-center mb-10"
                style={{ color: "var(--text-muted)" }}
              >
                Your mental health screening has been completed
              </p>
            </div>

            <ScreeningResultDisplay result={result} />

            {/* Next Steps and Info Cards Container */}
            <div className="max-w-3xl mx-auto space-y-6">
              <div
                className="rounded-lg border p-6 space-y-4"
                style={{
                  background: "var(--bg-light)",
                  borderColor: "var(--border-muted)",
                }}
              >
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    Next Steps
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    What would you like to do next?
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Based on your screening results, you must:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span
                        style={{ color: "var(--primary)" }}
                        className="mt-0.5"
                      >
                        1.
                      </span>
                      <span style={{ color: "var(--text)" }}>
                        <strong>Start a case assessment</strong> - Connect with
                        a PSG member who can provide personalized support and
                        guidance (Required first)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        style={{ color: "var(--text-muted)" }}
                        className="mt-0.5"
                      >
                        2.
                      </span>
                      <span style={{ color: "var(--text)" }}>
                        <strong>Book an appointment</strong> - Schedule a
                        one-on-one session with a peer support specialist
                        (Available after case assessment)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        style={{ color: "var(--text-muted)" }}
                        className="mt-0.5"
                      >
                        •
                      </span>
                      <span style={{ color: "var(--text)" }}>
                        <strong>Access resources</strong> - Explore mental
                        health resources and self-help materials
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleStartCaseAssessment}
                    disabled={hasCaseAssessment}
                    className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: hasCaseAssessment
                        ? "var(--bg-secondary)"
                        : "var(--primary)",
                      color: hasCaseAssessment
                        ? "var(--text-muted)"
                        : "var(--bg-dark)",
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {hasCaseAssessment
                      ? "Case Assessment Started"
                      : "Start Case Assessment"}
                  </button>
                  <button
                    onClick={() => {
                      if (!hasCaseAssessment) {
                        alert(
                          "Please start a case assessment first before booking an appointment."
                        );
                        return;
                      }
                      router.push("/dashboard/appointments");
                    }}
                    disabled={!hasCaseAssessment}
                    className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-sm transition border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                    title={
                      !hasCaseAssessment
                        ? "Please start a case assessment first"
                        : ""
                    }
                  >
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </button>
                  <button
                    onClick={handleTakeAnother}
                    className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-sm transition hover:bg-accent"
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Take Another Screening
                  </button>
                </div>
              </div>

              <div
                className="py-4 px-6 rounded-lg"
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                  background: "var(--bg-light)",
                  border: "1px solid var(--border-muted)",
                  textAlign: "justify",
                }}
              >
                <p>
                  Your screening result is <strong>anonymous</strong> and{" "}
                  <strong>confidential</strong>.<br />
                  Only authorized PSG members can review your responses to
                  provide support. Your identity will never be shared outside
                  the support team.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  );
}

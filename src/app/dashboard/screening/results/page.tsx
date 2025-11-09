"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreeningResultDisplay } from "@/components/screening/ScreeningResultDisplay";
import { ScreeningResult } from "@/lib/types/screening";

export default function ScreeningResultsPage() {
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load screening result from sessionStorage
    const storedResult = sessionStorage.getItem("screeningResult");

    if (!storedResult) {
      // No result found, redirect back to take screening
      router.push("/dashboard/screening/take");
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult) as ScreeningResult;
      setResult(parsedResult);
    } catch {
      // Invalid result, redirect back
      router.push("/dashboard/screening/take");
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleStartCaseAssessment = () => {
    // TODO: Navigate to case assessment chat when implemented
    // For now, navigate back to dashboard
    router.push("/dashboard");
  };

  const handleTakeAnother = () => {
    // Clear the stored result and go back to take screening
    sessionStorage.removeItem("screeningResult");
    router.push("/dashboard/screening/take");
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div
          className="p-8 text-center rounded-xl border shadow"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <p style={{ color: "var(--text-muted)" }}>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="space-y-2">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Screening Results
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Your mental health screening has been completed
        </p>
      </div>

      <ScreeningResultDisplay result={result} />

      <div
        className="rounded-xl border shadow p-6 space-y-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text)" }}
          >
            Next Steps
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            What would you like to do next?
          </p>
        </div>

        <div className="space-y-4">
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Based on your screening results, you can:
          </p>
          <ul className="space-y-2" style={{ fontSize: "0.875rem" }}>
            <li className="flex items-start gap-2">
              <span style={{ color: "var(--primary)" }} className="mt-0.5">
                •
              </span>
              <span style={{ color: "var(--text)" }}>
                <strong>Start a case assessment</strong> - Connect with a PSG
                member who can provide personalized support and guidance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "var(--primary)" }} className="mt-0.5">
                •
              </span>
              <span style={{ color: "var(--text)" }}>
                <strong>Book an appointment</strong> - Schedule a one-on-one
                session with a peer support specialist
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "var(--primary)" }} className="mt-0.5">
                •
              </span>
              <span style={{ color: "var(--text)" }}>
                <strong>Access resources</strong> - Explore mental health
                resources and self-help materials
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleStartCaseAssessment}
            className="w-full sm:w-auto px-8 py-2.5 rounded-md font-medium text-sm transition"
            style={{
              background: "var(--primary)",
              color: "var(--bg-dark)",
            }}
          >
            Start Case Assessment
          </button>
          <button
            onClick={() => router.push("/dashboard/appointments")}
            className="w-full sm:w-auto px-8 py-2.5 rounded-md font-medium text-sm transition border"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          >
            Book Appointment
          </button>
          <button
            onClick={handleTakeAnother}
            className="w-full sm:w-auto px-8 py-2.5 rounded-md font-medium text-sm transition hover:bg-accent"
            style={{
              color: "var(--text)",
            }}
          >
            Take Another Screening
          </button>
        </div>
      </div>

      <div
        className="text-center"
        style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
      >
        <p>
          Your screening results have been saved securely and will be reviewed
          by a trained PSG member.
        </p>
      </div>
    </div>
  );
}

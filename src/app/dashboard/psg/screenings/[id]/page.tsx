"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardClientWrapper } from "@/components/DashboardClientWrapper";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ScreeningResultDisplay } from "@/components/screening/ScreeningResultDisplay";
import { ScreeningResult, ScreeningResponse } from "@/lib/types/screening";
import {
  getScreeningById,
  updateScreeningReview,
} from "@/lib/actions/screening";
import { useAlert } from "@/components/AlertProvider";
import { Loader } from "@/components/Loader";

export default function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [responses, setResponses] = useState<ScreeningResponse[]>([]);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentNumber, setStudentNumber] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadScreening() {
      try {
        setIsLoading(true);
        const result = await getScreeningById(id);

        if (result.error || !result.data) {
          setError(result.error || "Failed to load screening");
          return;
        }

        setScreening(result.data.screening);
        setResponses(result.data.responses);

        // Get student number from localStorage
        const storedNumber = localStorage.getItem(
          `student_number_${result.data.screening.user_id}`
        );
        if (storedNumber) {
          setStudentNumber(parseInt(storedNumber));
        }
      } catch (err) {
        console.error("Error loading screening:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadScreening();
  }, [id]);
  const handleMarkAsReviewed = async () => {
    if (!screening) return;

    setIsSubmitting(true);
    try {
      const result = await updateScreeningReview(screening.id, reviewNotes);

      if (result.error) {
        showAlert({
          type: "error",
          message: "Failed to save review. Please try again.",
        });
        return;
      }

      showAlert({
        type: "success",
        message: "Screening marked as reviewed",
      });
      router.push("/dashboard/psg/screenings");
    } catch (err) {
      console.error("Error saving review:", err);
      showAlert({
        type: "error",
        message: "Failed to save review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStudentDisplay = () => {
    if (!isMounted || !screening) return "Student";
    return studentNumber ? `Student ${studentNumber}` : "Student";
  };

  if (isLoading) {
    return (
      <DashboardClientWrapper>
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
          <DashboardNavbar subtitle="PSG Member Portal" showHomeButton={true} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <Loader text="Loading screening details..." />
            </div>
          </main>
        </div>
      </DashboardClientWrapper>
    );
  }

  if (error || !screening) {
    return (
      <DashboardClientWrapper>
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
          <DashboardNavbar subtitle="PSG Member Portal" showHomeButton={true} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
              className="rounded-lg border p-6 text-center"
              style={{
                background: "var(--bg-light)",
                borderColor: "var(--border-muted)",
              }}
            >
              <AlertCircle
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "var(--error)" }}
              />
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text)" }}
              >
                {error || "Screening not found"}
              </h2>
              <button
                onClick={() => router.push("/dashboard/psg/screenings")}
                className="mt-4 px-6 py-2 rounded-md font-medium text-sm transition hover:bg-primary"
                style={{
                  background: "var(--primary)",
                  color: "var(--bg-dark)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--success)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--primary)";
                }}
              >
                Back to List
              </button>
            </div>
          </main>
        </div>
      </DashboardClientWrapper>
    );
  }

  return (
    <DashboardClientWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <DashboardNavbar subtitle="PSG Member Portal" showHomeButton={true} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Screening Review
                </h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {getStudentDisplay()} • {formatDate(screening.created_at)}
                </p>
              </div>
              {screening.reviewed_at ? (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text)",
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reviewed
                </span>
              ) : (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border"
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "rgb(59, 130, 246)",
                    borderColor: "rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending Review
                </span>
              )}
            </div>
          </div>

          <div className="max-w-4xl w-full mx-auto space-y-6 flex flex-col">
            {/* Screening Results */}
            <div className="w-full">
              <ScreeningResultDisplay result={screening} />
            </div>

            {/* Response Details */}
            <div
              className="rounded-lg border p-6 space-y-4 w-full"
              style={{
                background: "var(--bg-light)",
                borderColor: "var(--border-muted)",
              }}
            >
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Response Details
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  View the student&apos;s individual answers to screening
                  questions
                </p>
              </div>

              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div key={response.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          Question {index + 1}
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {response.question_text ||
                            "Question text not available"}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      >
                        Score: {response.score || 0}/10
                      </span>
                    </div>
                    <div
                      className="pl-4 py-2 border-l-2"
                      style={{ borderColor: "var(--primary-20)" }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        Answer: {String(response.answer)}
                      </p>
                    </div>
                    {index < responses.length - 1 && (
                      <div
                        className="h-[1px] w-full"
                        style={{ background: "var(--border)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Notes */}
            {!screening.reviewed_at && (
              <div
                className="rounded-lg border p-6 w-full"
                style={{
                  background: "var(--bg-light)",
                  borderColor: "var(--border-muted)",
                }}
              >
                <div className="mb-4">
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    Review Notes
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Add your observations and recommendations for this screening
                  </p>
                </div>
                <textarea
                  placeholder="Enter your review notes here..."
                  value={reviewNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setReviewNotes(e.target.value)
                  }
                  rows={6}
                  className="w-full rounded-md border px-3 py-2 text-base resize-none"
                  style={{
                    background: "transparent",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div
              className="rounded-lg border p-6 space-y-4 w-full"
              style={{
                background: "var(--bg-light)",
                borderColor: "var(--border-muted)",
              }}
            >
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Actions
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Review and manage this screening
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!screening.reviewed_at && (
                  <button
                    onClick={handleMarkAsReviewed}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-md font-medium text-sm transition border w-full sm:w-auto"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Mark as Reviewed"}
                  </button>
                )}

                <button
                  onClick={() => router.push("/dashboard/psg/screenings")}
                  className="px-8 py-2.5 rounded-md font-medium text-sm transition hover:bg-primary w-full sm:w-auto"
                  style={{
                    color: "var(--text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--bg-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text)";
                  }}
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  );
}

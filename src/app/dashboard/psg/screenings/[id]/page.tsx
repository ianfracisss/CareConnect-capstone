"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { ScreeningResultDisplay } from "@/components/screening/ScreeningResultDisplay";
import { ScreeningResult, ScreeningResponse } from "@/lib/types/screening";

// Mock data - in production, fetch from Supabase based on screening ID
const mockScreening: ScreeningResult = {
  id: "1",
  user_id: "student-1",
  total_score: 85,
  severity_score: 85,
  color_code: "red",
  recommendations: null,
  requires_immediate_attention: true,
  reviewed_by: null,
  reviewed_at: null,
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

const mockResponses: ScreeningResponse[] = [
  {
    id: "r1",
    screening_result_id: "1",
    question_id: "preset-0",
    answer: 8,
    score: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: "r2",
    screening_result_id: "1",
    question_id: "preset-1",
    answer: 9,
    score: 9,
    created_at: new Date().toISOString(),
  },
];

export default function ScreeningDetailPage() {
  const [screening] = useState<ScreeningResult>(mockScreening);
  const [responses] = useState<ScreeningResponse[]>(mockResponses);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleMarkAsReviewed = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Save review to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      alert("Screening marked as reviewed");
      router.push("/dashboard/psg/screenings");
    } catch {
      alert("Failed to save review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCaseAssessment = () => {
    // TODO: Navigate to case assessment chat
    router.push(`/dashboard/psg/cases/${screening.id}`);
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

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md transition hover:bg-accent"
          style={{ color: "var(--text)" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Screening Review
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Student #{screening.user_id.slice(-4)} •{" "}
            {formatDate(screening.created_at)}
          </p>
        </div>
        {screening.reviewed_at ? (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
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
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border"
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

      {/* Screening Results */}
      <ScreeningResultDisplay result={screening} />

      {/* Response Details */}
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
            Response Details
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            View the student&apos;s individual answers to screening questions
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
                    {/* TODO: Fetch actual question text from questions array */}
                    Question text would appear here
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
          className="rounded-xl border shadow p-6"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text)" }}
            >
              Review Notes
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
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
            Actions
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Choose how you would like to proceed with this case
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleStartCaseAssessment}
            className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-md font-medium text-sm transition w-full sm:w-auto"
            style={{
              background: "var(--primary)",
              color: "var(--bg-dark)",
            }}
          >
            <MessageSquare className="h-4 w-4" />
            Start Case Assessment
          </button>

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
            className="px-8 py-2.5 rounded-md font-medium text-sm transition hover:bg-accent w-full sm:w-auto"
            style={{
              color: "var(--text)",
            }}
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}

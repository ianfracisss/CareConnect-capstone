"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreeningForm } from "@/components/screening/ScreeningForm";
import {
  ScreeningQuestion,
  QuestionResponse,
  PRESET_SCREENING_QUESTIONS,
  calculateSeverity,
} from "@/lib/validations/screening";
import { ScreeningResult } from "@/lib/types/screening";
import { Loader2 } from "lucide-react";

export default function TakeScreeningPage() {
  const [questions] = useState<ScreeningQuestion[]>(() => {
    // Initialize questions with IDs on mount
    return PRESET_SCREENING_QUESTIONS.map((q, index) => ({
      ...q,
      id: `preset-${index}`,
    }));
  });
  // In production, this would be true while fetching from Supabase
  const [isLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (responses: QuestionResponse[]) => {
    try {
      // Calculate severity
      const result = calculateSeverity(responses);

      // TODO: In production, save to Supabase
      // For now, store in sessionStorage and navigate to results
      const fullResult: ScreeningResult = {
        id: `temp-${Date.now()}`,
        user_id: "current-user", // TODO: Get from auth context
        total_score: result.totalScore,
        severity_score: Math.round(result.percentage),
        color_code: result.color,
        recommendations: null,
        requires_immediate_attention: result.requiresImmediateAttention,
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      sessionStorage.setItem("screeningResult", JSON.stringify(fullResult));

      // Navigate to results page
      router.push("/dashboard/screening/results");
    } catch {
      alert("Failed to submit screening. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text)" }}
        >
          Mental Health Screening
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          This confidential screening will help us understand how you&apos;ve
          been feeling recently. Please answer honestly - there are no right or
          wrong answers.
        </p>
      </div>

      {/* Screening Form */}
      <ScreeningForm questions={questions} onSubmit={handleSubmit} />
    </div>
  );
}

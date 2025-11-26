"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardLoginAlert } from "@/components/DashboardLoginAlert";
import { ChatWidget } from "@/components/ChatWidget";
import { ChatWidgetPSG } from "@/components/ChatWidgetPSG";
import { hasExistingConversation } from "@/actions/messages";

export function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasCaseAssessment, setHasCaseAssessment] = useState(() => {
    // Initialize from sessionStorage
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("hasCaseAssessment") === "true";
    }
    return false;
  });
  const [hasConversation, setHasConversation] = useState(false);

  useEffect(() => {
    const getUserRole = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);

          // Check if student has existing conversation
          if (profile.role === "student") {
            const result = await hasExistingConversation();
            if (result.success && result.data) {
              setHasConversation(true);
            }
          }
        }
      }
    };

    getUserRole();
  }, []);

  useEffect(() => {
    // Check if student has started case assessment and listen for changes
    const handleStorageChange = () => {
      const status = sessionStorage.getItem("hasCaseAssessment");
      setHasCaseAssessment(status === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event from same page
    window.addEventListener("caseAssessmentChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("caseAssessmentChanged", handleStorageChange);
    };
  }, []);

  // Chat is enabled if student has case assessment OR has existing conversation
  const isChatEnabled = hasCaseAssessment || hasConversation;

  return (
    <>
      <DashboardLoginAlert />
      {children}
      {userRole === "student" && <ChatWidget disabled={!isChatEnabled} />}
      {(userRole === "psg_member" || userRole === "admin") && <ChatWidgetPSG />}
    </>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  Referral,
  ReferralWithProfiles,
  ReferralAssessment,
  ReferralUpdateWithProfile,
  ReferralSource,
  ReferralStatus,
  ReferralSeverity,
} from "@/types/referrals";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Create a new referral
export async function createReferral(data: {
  source: ReferralSource;
  reason: string;
  notes?: string;
  screening_result_id?: string;
}): Promise<ActionResponse<Referral>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const referralData = {
      student_id: user.id,
      source: data.source,
      reason: data.reason,
      notes: data.notes || null,
      screening_result_id: data.screening_result_id || null,
      status: "pending" as ReferralStatus,
    };

    const { data: referral, error } = await supabase
      .from("referrals")
      .insert(referralData)
      .select()
      .single();

    if (error) {
      console.error("Error creating referral:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: referral };
  } catch (error) {
    console.error("Unexpected error creating referral:", error);
    return { success: false, error: "Failed to create referral" };
  }
}

// Get all referrals for PSG members
export async function getAllReferrals(): Promise<
  ActionResponse<ReferralWithProfiles[]>
> {
  try {
    const supabase = await createClient();

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select(
        `
        *,
        student:profiles!referrals_student_id_fkey(id, full_name, email, school_id),
        assigned_psg_member:profiles!referrals_assigned_psg_member_id_fkey(id, full_name, email),
        reviewed_by_profile:profiles!referrals_reviewed_by_fkey(id, full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching referrals:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: referrals };
  } catch (error) {
    console.error("Unexpected error fetching referrals:", error);
    return { success: false, error: "Failed to fetch referrals" };
  }
}

// Get student's own referrals
export async function getStudentReferrals(
  studentId: string
): Promise<ActionResponse<ReferralWithProfiles[]>> {
  try {
    const supabase = await createClient();

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select(
        `
        *,
        student:profiles!referrals_student_id_fkey(id, full_name, email, school_id),
        assigned_psg_member:profiles!referrals_assigned_psg_member_id_fkey(id, full_name, email),
        reviewed_by_profile:profiles!referrals_reviewed_by_fkey(id, full_name)
      `
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching student referrals:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: referrals };
  } catch (error) {
    console.error("Unexpected error fetching student referrals:", error);
    return { success: false, error: "Failed to fetch referrals" };
  }
}

// Get single referral details
export async function getReferralById(
  referralId: string
): Promise<ActionResponse<ReferralWithProfiles>> {
  try {
    const supabase = await createClient();

    const { data: referral, error } = await supabase
      .from("referrals")
      .select(
        `
        *,
        student:profiles!referrals_student_id_fkey(id, full_name, email, school_id),
        assigned_psg_member:profiles!referrals_assigned_psg_member_id_fkey(id, full_name, email),
        reviewed_by_profile:profiles!referrals_reviewed_by_fkey(id, full_name)
      `
      )
      .eq("id", referralId)
      .single();

    if (error) {
      console.error("Error fetching referral:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: referral };
  } catch (error) {
    console.error("Unexpected error fetching referral:", error);
    return { success: false, error: "Failed to fetch referral" };
  }
}

// Update referral status and assignment
export async function updateReferralStatus(
  referralId: string,
  status: ReferralStatus,
  severity?: ReferralSeverity,
  assignedPsgMemberId?: string
): Promise<ActionResponse<Referral>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const updateData: Partial<Referral> = {
      status,
      ...(severity && { severity }),
      ...(status === "reviewed" && {
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }),
      ...(status === "assigned" &&
        assignedPsgMemberId && {
          assigned_psg_member_id: assignedPsgMemberId,
          assigned_at: new Date().toISOString(),
        }),
      ...(status === "completed" && {
        completed_at: new Date().toISOString(),
      }),
    };

    const { data: referral, error } = await supabase
      .from("referrals")
      .update(updateData)
      .eq("id", referralId)
      .select()
      .single();

    if (error) {
      console.error("Error updating referral:", error);
      return { success: false, error: error.message };
    }

    // Create update log
    await supabase.from("referral_updates").insert({
      referral_id: referralId,
      updated_by: user.id,
      update_type: "status_change",
      new_status: status,
      content: `Status changed to ${status}`,
    });

    return { success: true, data: referral };
  } catch (error) {
    console.error("Unexpected error updating referral:", error);
    return { success: false, error: "Failed to update referral" };
  }
}

// Create case assessment
export async function createReferralAssessment(
  data: Omit<
    ReferralAssessment,
    "id" | "created_at" | "updated_at" | "assessed_by"
  >
): Promise<ActionResponse<ReferralAssessment>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: assessment, error } = await supabase
      .from("referral_assessments")
      .insert({
        ...data,
        assessed_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating assessment:", error);
      return { success: false, error: error.message };
    }

    // Update referral severity based on assessment
    await supabase
      .from("referrals")
      .update({ severity: data.risk_level })
      .eq("id", data.referral_id);

    // Create update log
    await supabase.from("referral_updates").insert({
      referral_id: data.referral_id,
      updated_by: user.id,
      update_type: "assessment",
      content: `Case assessment completed with ${data.risk_level} risk level`,
    });

    return { success: true, data: assessment };
  } catch (error) {
    console.error("Unexpected error creating assessment:", error);
    return { success: false, error: "Failed to create assessment" };
  }
}

// Get case assessment for a referral
export async function getReferralAssessment(
  referralId: string
): Promise<ActionResponse<ReferralAssessment>> {
  try {
    const supabase = await createClient();

    const { data: assessment, error } = await supabase
      .from("referral_assessments")
      .select("*")
      .eq("referral_id", referralId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error fetching assessment:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: assessment || undefined };
  } catch (error) {
    console.error("Unexpected error fetching assessment:", error);
    return { success: false, error: "Failed to fetch assessment" };
  }
}

// Get referral updates
export async function getReferralUpdates(
  referralId: string
): Promise<ActionResponse<ReferralUpdateWithProfile[]>> {
  try {
    const supabase = await createClient();

    const { data: updates, error } = await supabase
      .from("referral_updates")
      .select(
        `
        *,
        updated_by_profile:profiles!referral_updates_updated_by_fkey(id, full_name, role)
      `
      )
      .eq("referral_id", referralId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching referral updates:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: updates };
  } catch (error) {
    console.error("Unexpected error fetching referral updates:", error);
    return { success: false, error: "Failed to fetch updates" };
  }
}

// Add a note to referral
export async function addReferralNote(
  referralId: string,
  content: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { error } = await supabase.from("referral_updates").insert({
      referral_id: referralId,
      updated_by: user.id,
      update_type: "note",
      content,
    });

    if (error) {
      console.error("Error adding note:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error adding note:", error);
    return { success: false, error: "Failed to add note" };
  }
}

// Escalate referral to OCCS
export async function escalateReferral(
  referralId: string,
  escalatedTo: string,
  escalationReason: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { error } = await supabase
      .from("referrals")
      .update({
        status: "escalated",
        escalated_to: escalatedTo,
        escalation_reason: escalationReason,
      })
      .eq("id", referralId);

    if (error) {
      console.error("Error escalating referral:", error);
      return { success: false, error: error.message };
    }

    // Create update log
    await supabase.from("referral_updates").insert({
      referral_id: referralId,
      updated_by: user.id,
      update_type: "escalation",
      content: `Escalated to ${escalatedTo}: ${escalationReason}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Unexpected error escalating referral:", error);
    return { success: false, error: "Failed to escalate referral" };
  }
}

// Get all PSG members
export async function getPSGMembers(): Promise<
  ActionResponse<Array<{ id: string; full_name: string; email: string }>>
> {
  try {
    const supabase = await createClient();

    const { data: psgMembers, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "psg_member")
      .order("full_name");

    if (error) {
      console.error("Error fetching PSG members:", error);
      return { success: false, error: "Failed to load PSG members" };
    }

    return { success: true, data: psgMembers };
  } catch (error) {
    console.error("Unexpected error fetching PSG members:", error);
    return { success: false, error: "Failed to load PSG members" };
  }
}

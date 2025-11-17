"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  UserProfile,
  UpdateUserInput,
  SystemStats,
  AppointmentReport,
  ReferralReport,
  SessionReport,
  UsageReport,
  AuditLog,
  ReportFilters,
} from "@/types/admin";

// =============================
// User Management
// =============================

export async function getAllUsers() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get all users error:", error);
      return { success: false, error: "Failed to fetch users" };
    }

    return { success: true, data: data as UserProfile[] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getUserById(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Get user error:", error);
      return { success: false, error: "Failed to fetch user" };
    }

    return { success: true, data: data as UserProfile };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateUser(userId: string, updates: UpdateUserInput) {
  try {
    const supabase = await createClient();

    // Check if admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Only admins can update users" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update user error:", error);
      return { success: false, error: "Failed to update user" };
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true, data: data as UserProfile };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = await createClient();

    // Check if admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Only admins can delete users" };
    }

    // Delete from profiles (cascades to other tables)
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      console.error("Delete user error:", error);
      return { success: false, error: "Failed to delete user" };
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =============================
// System Statistics
// =============================

export async function getSystemStats(): Promise<{
  success: boolean;
  data?: SystemStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get user counts
    const { data: users } = await supabase.from("profiles").select("role");

    const total_users = users?.length || 0;
    const total_students =
      users?.filter((u) => u.role === "student").length || 0;
    const total_psg_members =
      users?.filter((u) => u.role === "psg_member").length || 0;
    const total_admins = users?.filter((u) => u.role === "admin").length || 0;

    // Get appointment counts
    const { count: total_appointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true });

    const { count: appointments_this_month } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      );

    // Get referral counts
    const { count: total_referrals } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true });

    const { count: referrals_this_month } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      );

    // Get session counts
    const { count: total_sessions } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true });

    const { count: sessions_this_month } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      );

    const stats: SystemStats = {
      total_users,
      total_students,
      total_psg_members,
      total_admins,
      total_appointments: total_appointments || 0,
      total_referrals: total_referrals || 0,
      total_sessions: total_sessions || 0,
      appointments_this_month: appointments_this_month || 0,
      referrals_this_month: referrals_this_month || 0,
      sessions_this_month: sessions_this_month || 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =============================
// Reporting
// =============================

export async function getAppointmentReports(filters?: ReportFilters) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_date,
        status,
        duration_minutes,
        location_type,
        created_at,
        student:profiles!appointments_student_id_fkey(id, full_name, school_id),
        psg_member:profiles!appointments_psg_member_id_fkey(id, full_name)
      `
      )
      .order("appointment_date", { ascending: false });

    if (filters?.start_date) {
      query = query.gte("appointment_date", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("appointment_date", filters.end_date);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.psg_member_id) {
      query = query.eq("psg_member_id", filters.psg_member_id);
    }
    if (filters?.student_id) {
      query = query.eq("student_id", filters.student_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get appointment reports error:", error);
      return { success: false, error: "Failed to fetch appointment reports" };
    }

    const reports: AppointmentReport[] =
      data?.map((apt: any) => ({
        id: apt.id,
        student_name: apt.student?.full_name || "Unknown",
        student_id: apt.student?.school_id || "N/A",
        psg_member_name: apt.psg_member?.full_name || "Unknown",
        appointment_date: apt.appointment_date,
        status: apt.status,
        duration_minutes: apt.duration_minutes,
        location_type: apt.location_type,
        created_at: apt.created_at,
      })) || [];

    return { success: true, data: reports };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getReferralReports(filters?: ReportFilters) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("referrals")
      .select(
        `
        id,
        source,
        status,
        severity,
        created_at,
        updated_at,
        student:profiles!referrals_student_id_fkey(id, full_name, school_id),
        assigned_psg_member:profiles!referrals_assigned_psg_member_id_fkey(full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("created_at", filters.end_date);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.psg_member_id) {
      query = query.eq("assigned_psg_member_id", filters.psg_member_id);
    }
    if (filters?.student_id) {
      query = query.eq("student_id", filters.student_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get referral reports error:", error);
      return { success: false, error: "Failed to fetch referral reports" };
    }

    const reports: ReferralReport[] =
      data?.map((ref: any) => ({
        id: ref.id,
        student_name: ref.student?.full_name || "Unknown",
        student_id: ref.student?.school_id || "N/A",
        source: ref.source,
        status: ref.status,
        severity: ref.severity,
        assigned_psg_member: ref.assigned_psg_member?.full_name,
        created_at: ref.created_at,
        updated_at: ref.updated_at,
      })) || [];

    return { success: true, data: reports };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getSessionReports(filters?: ReportFilters) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("sessions")
      .select(
        `
        id,
        duration_minutes,
        notes,
        feedback,
        created_at,
        appointment:appointments(
          appointment_date,
          student:profiles!appointments_student_id_fkey(full_name, school_id),
          psg_member:profiles!appointments_psg_member_id_fkey(full_name)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("created_at", filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get session reports error:", error);
      return { success: false, error: "Failed to fetch session reports" };
    }

    const reports: SessionReport[] =
      data?.map((sess: any) => ({
        id: sess.id,
        student_name: sess.appointment?.student?.full_name || "Unknown",
        student_id: sess.appointment?.student?.school_id || "N/A",
        psg_member_name: sess.appointment?.psg_member?.full_name || "Unknown",
        appointment_date: sess.appointment?.appointment_date || "",
        duration_minutes: sess.duration_minutes || 0,
        has_notes: !!sess.notes,
        has_feedback: !!sess.feedback,
        created_at: sess.created_at,
      })) || [];

    return { success: true, data: reports };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getUsageReport(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: UsageReport; error?: string }> {
  try {
    const supabase = await createClient();

    // Get appointment counts
    const { count: total_appointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const { count: completed_appointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const { count: cancelled_appointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Get referral counts
    const { count: total_referrals } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Get session counts
    const { count: total_sessions } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Get user counts
    const { count: total_users } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Get active PSG members (those with appointments in period)
    const { data: activePSG } = await supabase
      .from("appointments")
      .select("psg_member_id")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const active_psg_members = new Set(activePSG?.map((a) => a.psg_member_id))
      .size;

    const report: UsageReport = {
      period: `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`,
      total_appointments: total_appointments || 0,
      completed_appointments: completed_appointments || 0,
      cancelled_appointments: cancelled_appointments || 0,
      total_referrals: total_referrals || 0,
      total_sessions: total_sessions || 0,
      total_users: total_users || 0,
      active_psg_members,
    };

    return { success: true, data: report };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =============================
// Audit Logs
// =============================

export async function getAuditLogs(limit: number = 100) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
        *,
        user:profiles(full_name, role)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get audit logs error:", error);
      return { success: false, error: "Failed to fetch audit logs" };
    }

    const logs: AuditLog[] =
      data?.map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        user_name: log.user?.full_name || "Unknown",
        user_role: log.user?.role || "student",
        action: log.action,
        table_name: log.table_name,
        record_id: log.record_id,
        details: log.details,
        created_at: log.created_at,
      })) || [];

    return { success: true, data: logs };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

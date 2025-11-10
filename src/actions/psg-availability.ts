"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CreatePSGAvailabilityInput,
  PSGAvailability,
  PSGAvailabilityWithProfile,
  AvailableTimeSlot,
} from "@/types/appointments";

// =============================
// PSG Availability CRUD
// =============================

export async function createPSGAvailability(input: CreatePSGAvailabilityInput) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify PSG member can only create their own availability
    if (input.psg_member_id !== user.id) {
      return {
        success: false,
        error: "You can only manage your own availability",
      };
    }

    const { data, error } = await supabase
      .from("psg_availability")
      .insert({
        psg_member_id: input.psg_member_id,
        day_of_week: input.day_of_week,
        start_time: input.start_time,
        end_time: input.end_time,
        is_active: input.is_active !== undefined ? input.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create availability error:", error);
      return { success: false, error: "Failed to create availability" };
    }

    revalidatePath("/dashboard/psg/availability");
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getPSGAvailability(psgMemberId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("psg_availability")
      .select("*")
      .eq("psg_member_id", psgMemberId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Get availability error:", error);
      return { success: false, error: "Failed to fetch availability" };
    }

    return { success: true, data: data as PSGAvailability[] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAllActivePSGAvailability() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("psg_availability")
      .select(
        `
        *,
        psg_member:profiles!psg_member_id(id, full_name, avatar_url)
      `
      )
      .eq("is_active", true)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Get all availability error:", error);
      return { success: false, error: "Failed to fetch availability" };
    }

    return { success: true, data: data as PSGAvailabilityWithProfile[] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updatePSGAvailability(
  availabilityId: string,
  updates: Partial<CreatePSGAvailabilityInput>
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("psg_availability")
      .update(updates)
      .eq("id", availabilityId)
      .select()
      .single();

    if (error) {
      console.error("Update availability error:", error);
      return { success: false, error: "Failed to update availability" };
    }

    revalidatePath("/dashboard/psg/availability");
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deletePSGAvailability(availabilityId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("psg_availability")
      .delete()
      .eq("id", availabilityId);

    if (error) {
      console.error("Delete availability error:", error);
      return { success: false, error: "Failed to delete availability" };
    }

    revalidatePath("/dashboard/psg/availability");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function togglePSGAvailability(
  availabilityId: string,
  isActive: boolean
) {
  return updatePSGAvailability(availabilityId, { is_active: isActive });
}

// =============================
// Available Time Slots Generation
// =============================

export async function getAvailableTimeSlots(
  startDate: string,
  endDate: string,
  durationMinutes: number = 60
): Promise<{ success: boolean; data?: AvailableTimeSlot[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Get all active PSG members with their availability
    const { data: availabilities, error: availError } = await supabase
      .from("psg_availability")
      .select(
        `
        *,
        psg_member:profiles!psg_member_id(id, full_name, avatar_url)
      `
      )
      .eq("is_active", true);

    if (availError) {
      console.error("Get availabilities error:", availError);
      return { success: false, error: "Failed to fetch availabilities" };
    }

    if (!availabilities || availabilities.length === 0) {
      console.log("No active availabilities found");
      return { success: true, data: [] };
    }

    console.log("Found availabilities:", availabilities.length);

    // Generate time slots
    const slots: AvailableTimeSlot[] = [];
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");

    console.log("Date range:", start, "to", end);

    // Iterate through each day in the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      console.log(
        "Checking date:",
        currentDate.toISOString().split("T")[0],
        "day:",
        dayOfWeek
      );

      console.log(
        "Checking date:",
        currentDate.toISOString().split("T")[0],
        "day:",
        dayOfWeek
      );

      // Find availabilities for this day of week
      const dayAvailabilities =
        availabilities?.filter((av) => {
          console.log(
            "Availability day_of_week:",
            av.day_of_week,
            "comparing to:",
            dayOfWeek
          );
          return av.day_of_week === dayOfWeek;
        }) || [];

      console.log("Day availabilities found:", dayAvailabilities.length);

      for (const availability of dayAvailabilities) {
        // Parse time strings (format: "HH:MM:SS")
        const [startHour, startMinute, startSecond] = availability.start_time
          .split(":")
          .map(Number);
        const [endHour, endMinute, endSecond] = availability.end_time
          .split(":")
          .map(Number);

        // Create date objects in local timezone for the current date
        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, startSecond || 0, 0);

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, endSecond || 0, 0);

        const now = new Date();
        console.log(
          "Slot window (UTC):",
          slotStart.toISOString(),
          "to",
          slotEnd.toISOString()
        );
        console.log(
          "Slot window (local):",
          slotStart.toLocaleString(),
          "to",
          slotEnd.toLocaleString()
        );
        console.log(
          "Current time (now):",
          now.toISOString(),
          "(local:",
          now.toLocaleString() + ")"
        );

        // Skip if slot is in the past
        if (slotEnd <= now) {
          console.log("Skipping past slot - slot ends before now");
          continue;
        }

        // Generate slots every hour (or specified duration)
        let currentSlot = new Date(slotStart);

        // If start time is in the past, start from next available hour
        if (currentSlot < now) {
          const minutesFromNow = Math.ceil(
            (now.getTime() - currentSlot.getTime()) / (1000 * 60)
          );
          const slotsToSkip = Math.ceil(minutesFromNow / durationMinutes);
          currentSlot.setMinutes(
            currentSlot.getMinutes() + slotsToSkip * durationMinutes
          );
        }

        while (currentSlot < slotEnd) {
          const nextSlot = new Date(currentSlot);
          nextSlot.setMinutes(currentSlot.getMinutes() + durationMinutes);

          if (nextSlot <= slotEnd) {
            // Format the date and time separately to avoid timezone issues
            // The database expects times in local timezone (matching start_time/end_time)
            const year = currentSlot.getFullYear();
            const month = String(currentSlot.getMonth() + 1).padStart(2, "0");
            const day = String(currentSlot.getDate()).padStart(2, "0");
            const hours = String(currentSlot.getHours()).padStart(2, "0");
            const minutes = String(currentSlot.getMinutes()).padStart(2, "0");
            const seconds = String(currentSlot.getSeconds()).padStart(2, "0");

            // Create timestamp without timezone conversion
            const appointmentTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            // Check if this slot is available (no conflicts)
            const { data: isAvailable, error: rpcError } = await supabase.rpc(
              "is_psg_available",
              {
                p_psg_member_id: availability.psg_member_id,
                p_appointment_date: appointmentTimestamp,
                p_duration_minutes: durationMinutes,
              }
            );

            if (rpcError) {
              console.error("RPC error:", rpcError);
            }

            console.log(
              "Slot availability check:",
              appointmentTimestamp,
              "(ISO:",
              currentSlot.toISOString() + ") Available:",
              isAvailable
            );

            if (isAvailable) {
              const psgMember = (availability as PSGAvailabilityWithProfile)
                .psg_member;

              // Store the full timestamp for accurate booking
              const year = currentSlot.getFullYear();
              const month = String(currentSlot.getMonth() + 1).padStart(2, "0");
              const day = String(currentSlot.getDate()).padStart(2, "0");
              const hours = String(currentSlot.getHours()).padStart(2, "0");
              const minutes = String(currentSlot.getMinutes()).padStart(2, "0");
              const seconds = String(currentSlot.getSeconds()).padStart(2, "0");
              const appointmentTimestampForBooking = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

              slots.push({
                psg_member_id: availability.psg_member_id,
                psg_member_name: psgMember.full_name,
                psg_member_avatar: psgMember.avatar_url,
                date: currentSlot.toISOString().split("T")[0],
                start_time: currentSlot
                  .toTimeString()
                  .split(" ")[0]
                  .substring(0, 5),
                end_time: nextSlot.toTimeString().split(" ")[0].substring(0, 5),
                duration_minutes: durationMinutes,
                appointment_timestamp: appointmentTimestampForBooking, // Add this for booking
              });
            }
          }

          currentSlot = nextSlot;
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Total slots generated:", slots.length);
    return { success: true, data: slots };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAvailablePSGMembers(
  date: string,
  time: string,
  durationMinutes: number = 60
) {
  try {
    const supabase = await createClient();

    // Construct appointment date
    const appointmentDate = new Date(`${date}T${time}`);
    const dayOfWeek = appointmentDate.getDay();

    // Get PSG members who have availability for this day and time
    const { data: availabilities, error } = await supabase
      .from("psg_availability")
      .select(
        `
        *,
        psg_member:profiles!psg_member_id(id, full_name, avatar_url)
      `
      )
      .eq("is_active", true)
      .eq("day_of_week", dayOfWeek)
      .lte("start_time", time)
      .gte("end_time", time);

    if (error) {
      console.error("Get available PSG members error:", error);
      return { success: false, error: "Failed to fetch available PSG members" };
    }

    // Filter out PSG members with conflicts
    const availableMembers = [];
    for (const availability of availabilities || []) {
      const { data: isAvailable } = await supabase.rpc("is_psg_available", {
        p_psg_member_id: availability.psg_member_id,
        p_appointment_date: appointmentDate.toISOString(),
        p_duration_minutes: durationMinutes,
      });

      if (isAvailable) {
        const psgMember = (availability as PSGAvailabilityWithProfile)
          .psg_member;
        availableMembers.push(psgMember);
      }
    }

    return { success: true, data: availableMembers };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

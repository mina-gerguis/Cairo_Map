import { supabase } from "./supabase";

/**
 * Gets the total number of pending proposals, reports, and app feedback for a specific user.
 * A request is considered pending if it is not yet approved/accepted or rejected by the admin.
 */
export async function getPendingFeedbackCount(userId: string): Promise<number> {
  if (!supabase) return 0;
  try {
    // 1. place_proposals pending count (status is 'pending')
    const { count: proposalsCount, error: propErr } = await supabase
      .from("place_proposals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (propErr) console.error("Error counting place proposals:", propErr);

    // 2. place_reports pending count (status is 'pending' or 'reviewed')
    const { count: reportsCount, error: repErr } = await supabase
      .from("place_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["pending", "reviewed"]);

    if (repErr) console.error("Error counting place reports:", repErr);

    // 3. app_feedback pending count (status is 'pending' or 'reviewed')
    const { count: feedbackCount, error: feedErr } = await supabase
      .from("app_feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["pending", "reviewed"]);

    if (feedErr) console.error("Error counting app feedback:", feedErr);

    const total = (proposalsCount || 0) + (reportsCount || 0) + (feedbackCount || 0);
    return total;
  } catch (err) {
    console.error("Error checking pending feedback limit:", err);
    return 0;
  }
}

/**
 * Checks if the user has reached or exceeded the pending limit of 5.
 */
export async function isFeedbackLimitReached(userId: string): Promise<boolean> {
  const count = await getPendingFeedbackCount(userId);
  return count >= 5;
}

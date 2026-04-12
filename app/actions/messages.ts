"use server"

import { createClient } from "@/lib/supabase/server"

export async function updateMessageFeedback(
  messageId: string,
  feedback: "like" | "dislike" | null
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from("messages")
    .update({ user_feedback: feedback })
    .eq("message_id", messageId)
}

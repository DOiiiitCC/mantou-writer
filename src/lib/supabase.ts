import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Get or create a persistent anonymous user ID
export function getUserId(): string {
  const key = "mantou-user-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Sync data to Supabase
export async function syncToCloud(data: Record<string, unknown>) {
  const userId = getUserId();
  const { error } = await supabase.from("user_data").upsert(
    {
      user_id: userId,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) console.error("Sync error:", error);
}

// Load data from Supabase
export async function loadFromCloud(): Promise<Record<string, unknown> | null> {
  const userId = getUserId();
  const { data, error } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data.data as Record<string, unknown>;
}

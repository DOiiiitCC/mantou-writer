import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  supabaseClient = createClient(url, key, { auth: { persistSession: false } });
  return supabaseClient;
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  const key = "mantou-user-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export async function syncToCloud(data: Record<string, unknown>) {
  const client = getClient();
  const userId = getUserId();
  if (!client || !userId) return;

  await client.from("user_data").upsert(
    { user_id: userId, data, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

export async function loadFromCloud(): Promise<Record<string, unknown> | null> {
  const client = getClient();
  const userId = getUserId();
  if (!client || !userId) return null;

  const { data, error } = await client
    .from("user_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.data as Record<string, unknown>;
}

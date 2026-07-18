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

// Simple sync key — user sets it once, same key on all devices = shared data
const SYNC_KEY = "mantou-sync-key";

export function getSyncKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_KEY);
}

export function setSyncKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_KEY, key);
}

export function hasSyncKey(): boolean {
  return !!getSyncKey();
}

export async function syncToCloud(data: Record<string, unknown>) {
  const client = getClient();
  const key = getSyncKey();
  if (!client || !key) return;

  await client.from("user_data").upsert(
    { user_id: key, data, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

export async function loadFromCloud(): Promise<Record<string, unknown> | null> {
  const client = getClient();
  const key = getSyncKey();
  if (!client || !key) return null;

  const { data, error } = await client
    .from("user_data")
    .select("data")
    .eq("user_id", key)
    .maybeSingle();

  if (error || !data) return null;
  return data.data as Record<string, unknown>;
}

import { isSupabaseConfigured } from "@/lib/server/db/supabase";
import { memoryRepository } from "./memory";
import { supabaseRepository } from "./supabase";
import type { EastauraRepository } from "./types";

export type PersistenceMode = "memory" | "supabase";

export function getPersistenceMode(): PersistenceMode {
  return isSupabaseConfigured() ? "supabase" : "memory";
}

export function getRepository(): EastauraRepository {
  return isSupabaseConfigured() ? supabaseRepository : memoryRepository;
}

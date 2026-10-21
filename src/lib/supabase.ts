import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Singleton Supabase Client pour les fonctionnalités client (Realtime / Écoute de changements).
 * Note : L'authentification principale de l'application est déléguée à Better-Auth,
 * persistSession est donc désactivé pour éviter les conflits GoTrueClient dans le navigateur.
 */
export const supabase: SupabaseClient | null =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey, {
              auth: {
                  persistSession: false,
                  autoRefreshToken: false,
              },
          })
        : null;

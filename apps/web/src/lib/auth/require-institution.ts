import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

type InstitutionContext = {
  user: User;
  profile: Profile;
  supabase: SupabaseClient;
};

type AuthFailure = {
  error: string;
  status: 401 | 403;
};

export async function requireInstitutionUser(): Promise<
  InstitutionContext | AuthFailure
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in required", status: 401 };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, institution_id, mfa_enrolled")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { error: "Profile not found", status: 403 };
  }

  if (profile.role !== "institution" || !profile.institution_id) {
    return {
      error: "Institution access only. Apply and wait for admin approval.",
      status: 403,
    };
  }

  return { user, profile: profile as Profile, supabase };
}

export async function requireAuthenticatedUser(): Promise<
  | { user: User; supabase: SupabaseClient }
  | AuthFailure
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in required", status: 401 };
  }

  return { user, supabase };
}

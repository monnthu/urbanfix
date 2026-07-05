import { createClient } from "@/lib/supabase/server";
import type { Institution, InstitutionContext, Profile } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

type AuthFailure = {
  error: string;
  status: 401 | 403;
};

type InstitutionAuthContext = {
  user: User;
  profile: Profile;
  institution: Institution;
  supabase: SupabaseClient;
};

export async function requireInstitutionUser(): Promise<
  InstitutionAuthContext | AuthFailure
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Inicia sesión para continuar", status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Perfil no encontrado", status: 403 };
  }

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select(
      "id, profile_id, name, official_domain, category, zone, status, created_at, reviewed_at"
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  if (institutionError || !institution) {
    return {
      error: "Solo usuarios institucionales verificados. Solicita acceso primero.",
      status: 403,
    };
  }

  if (institution.status !== "approved" || profile.role !== "institution") {
    return {
      error: "Tu institución aún no está aprobada.",
      status: 403,
    };
  }

  return {
    user,
    profile: profile as Profile,
    institution: institution as Institution,
    supabase,
  };
}

export async function getInstitutionContext(
  supabase: SupabaseClient,
  userId: string
): Promise<InstitutionContext | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, created_at")
    .eq("id", userId)
    .single();

  if (!profile || profile.role !== "institution") {
    return null;
  }

  const { data: institution } = await supabase
    .from("institutions")
    .select(
      "id, profile_id, name, official_domain, category, zone, status, created_at, reviewed_at"
    )
    .eq("profile_id", userId)
    .eq("status", "approved")
    .maybeSingle();

  if (!institution) {
    return null;
  }

  return {
    profile: profile as Profile,
    institution: institution as Institution,
  };
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
    return { error: "Inicia sesión para continuar", status: 401 };
  }

  return { user, supabase };
}

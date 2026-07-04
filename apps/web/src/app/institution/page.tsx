import { InstitutionDashboard } from "@/components/institution/InstitutionDashboard";
import { fetchAssignedReports } from "@/lib/reports/queries";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function InstitutionDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main>
        <h1>Institution dashboard</h1>
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          Sign in with an approved institution account to view assigned reports
          and use the AI assistant.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/">← Home</Link>
        </p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, institution_id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "institution" || !profile.institution_id) {
    return (
      <main>
        <h1>Institution dashboard</h1>
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          This area is for verified institution users only. Apply for access and
          wait for admin approval.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/institution/apply">Apply for institution access</Link>
          {" · "}
          <Link href="/">Home</Link>
        </p>
      </main>
    );
  }

  const { data: institution } = await supabase
    .from("institutions")
    .select("name")
    .eq("id", profile.institution_id)
    .single();

  let reports: Awaited<ReturnType<typeof fetchAssignedReports>> = [];

  try {
    reports = await fetchAssignedReports(supabase, profile.institution_id);
  } catch {
    reports = [];
  }

  return (
    <main>
      <h1>Institution dashboard</h1>
      <p className="muted" style={{ marginTop: "0.5rem" }}>
        {institution?.name ?? "Your institution"} · {reports.length} assigned
        report{reports.length === 1 ? "" : "s"}
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Home</Link>
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <InstitutionDashboard initialReports={reports} />
      </div>
    </main>
  );
}

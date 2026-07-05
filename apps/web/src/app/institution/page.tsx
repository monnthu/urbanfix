import { InstitutionDashboard } from "@/components/institution/InstitutionDashboard";
import { getInstitutionContext } from "@/lib/auth/require-institution";
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
        <h1>Panel institucional</h1>
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          Inicia sesión con una cuenta institucional aprobada para ver reportes
          asignados y usar el asistente de IA.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/">← Inicio</Link>
        </p>
      </main>
    );
  }

  const context = await getInstitutionContext(supabase, user.id);

  if (!context) {
    return (
      <main>
        <h1>Panel institucional</h1>
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          Esta área es solo para instituciones verificadas. Solicita acceso y
          espera la aprobación del administrador.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/institution/apply">Solicitar acceso institucional</Link>
          {" · "}
          <Link href="/">Inicio</Link>
        </p>
      </main>
    );
  }

  let reports: Awaited<ReturnType<typeof fetchAssignedReports>> = [];

  try {
    reports = await fetchAssignedReports(supabase, context.institution.id);
  } catch {
    reports = [];
  }

  return (
    <main>
      <h1>Panel institucional</h1>
      <p className="muted" style={{ marginTop: "0.5rem" }}>
        {context.institution.name} · {reports.length} reporte
        {reports.length === 1 ? "" : "s"} asignado
        {reports.length === 1 ? "" : "s"}
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Inicio</Link>
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <InstitutionDashboard initialReports={reports} />
      </div>
    </main>
  );
}

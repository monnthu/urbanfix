import Link from "next/link";

export default function InstitutionDashboardPage() {
  return (
    <main>
      <h1>Institution dashboard</h1>
      <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
        Assigned reports and AI chat — coming next.
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Home</Link>
      </p>
    </main>
  );
}

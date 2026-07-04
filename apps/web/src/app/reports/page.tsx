import Link from "next/link";

export default function ReportsPage() {
  return (
    <main>
      <h1>Reports</h1>
      <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
        Community reports — list view coming next.
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Home</Link>
      </p>
    </main>
  );
}

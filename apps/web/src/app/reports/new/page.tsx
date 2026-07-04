import Link from "next/link";

export default function NewReportPage() {
  return (
    <main>
      <h1>New report</h1>
      <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
        Report form with image upload — coming next.
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/reports">← Reports</Link>
      </p>
    </main>
  );
}

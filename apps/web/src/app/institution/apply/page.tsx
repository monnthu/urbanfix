import Link from "next/link";

export default function InstitutionApplyPage() {
  return (
    <main>
      <h1>Institution application</h1>
      <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
        Official-domain verification and admin approval — coming next.
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/institution">← Institution</Link>
      </p>
    </main>
  );
}

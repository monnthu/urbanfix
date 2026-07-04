import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Civic Reporting Platform</h1>
      <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
        Report urban problems to verified government institutions.
      </p>

      <div className="grid grid-2" style={{ marginTop: "2rem" }}>
        <section className="card">
          <h2>Civilians</h2>
          <p style={{ marginTop: "0.5rem" }}>
            Submit reports, verify community issues, and view the map.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/reports">View reports</Link>
            {" · "}
            <Link href="/reports/new">New report</Link>
            {" · "}
            <Link href="/map">Map</Link>
          </p>
        </section>

        <section className="card">
          <h2>Institutions</h2>
          <p style={{ marginTop: "0.5rem" }}>
            Review assigned reports and use the AI assistant.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/institution">Dashboard</Link>
            {" · "}
            <Link href="/institution/apply">Apply for access</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

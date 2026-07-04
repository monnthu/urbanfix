import Link from "next/link";

export default function MapPage() {
  return (
    <main>
      <h1>Map</h1>
      <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
        Leaflet map with category icons and legend — coming next.
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Home</Link>
      </p>
    </main>
  );
}

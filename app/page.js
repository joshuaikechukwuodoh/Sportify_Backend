// app/page.js – root page for the Next.js app

export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Spotify Backend
      </h1>
      <p style={{ fontSize: "1.25rem" }}>
        🎧 Your API is up and running! Explore the endpoints under{" "}
        <code>/api</code>.
      </p>
    </main>
  );
}

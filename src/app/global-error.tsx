"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <title>Something went wrong · Stockroom</title>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Stockroom couldn&apos;t load</h1>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>A critical error stopped the app from starting.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ padding: "10px 18px", borderRadius: 8, border: 0, background: "#0b7a69", color: "white", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

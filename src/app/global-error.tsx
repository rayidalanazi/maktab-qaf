"use client";

/**
 * Global error boundary. Catches unrecoverable client errors so the user gets
 * a branded "something broke" screen with a retry, instead of a blank crash.
 * In dev the message is shown; in production it stays generic.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          background: "#0A0A0A",
          color: "#F5F5F5",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>صار خلل بسيط</h1>
          <p style={{ color: "#A1A1A1", marginBottom: 20, fontSize: 14 }}>
            حصل خطأ غير متوقع. جرّب تحدّث الصفحة — وإذا تكرر، كلّمنا.
          </p>
          {isDev && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                color: "#D6FF3D",
                fontSize: 12,
                textAlign: "left",
                maxWidth: 600,
                margin: "0 auto 20px",
                fontFamily: "monospace",
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              background: "#D6FF3D",
              color: "#0A0A0A",
              border: 0,
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}

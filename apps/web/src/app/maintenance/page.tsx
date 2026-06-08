import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "We'll Be Right Back | Bhavana Studio",
  description: "Bhavana Studio is currently undergoing scheduled maintenance.",
};

export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafaf9",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
        textAlign: "center",
      }}
    >
      {/* Logo / Studio name */}
      <p
        style={{
          fontFamily: "'Cormorant', serif",
          fontSize: "0.85rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#78716c",
          marginBottom: "2.5rem",
        }}
      >
        Bhavana Studio
      </p>

      {/* Divider line */}
      <div
        style={{
          width: "3rem",
          height: "1px",
          backgroundColor: "#d6d3d1",
          marginBottom: "2.5rem",
        }}
      />

      {/* Heading */}
      <h1
        style={{
          fontFamily: "'Cormorant', serif",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 300,
          color: "#1c1917",
          lineHeight: 1.2,
          marginBottom: "1.5rem",
          maxWidth: "600px",
        }}
      >
        We&rsquo;ll Be Right Back
      </h1>

      {/* Body copy */}
      <p
        style={{
          fontSize: "1rem",
          color: "#78716c",
          lineHeight: 1.8,
          maxWidth: "480px",
          marginBottom: "3rem",
        }}
      >
        We&rsquo;re making some improvements to give you a better experience.
        Our website will be back shortly. Thank you for your patience.
      </p>

      {/* Contact block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          fontSize: "0.9rem",
          color: "#57534e",
        }}
      >
        <p style={{ margin: 0 }}>For urgent inquiries:</p>

        <a
          href="tel:+919387103562"
          style={{
            color: "#1c1917",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          📞 +91 93871 03562
        </a>

        <a
          href="mailto:bhavanastudio@gmail.com"
          style={{
            color: "#1c1917",
            textDecoration: "none",
          }}
        >
          ✉️ bhavanastudio@gmail.com
        </a>
      </div>

      {/* Bottom divider */}
      <div
        style={{
          width: "3rem",
          height: "1px",
          backgroundColor: "#d6d3d1",
          margin: "3rem auto 1.5rem",
        }}
      />

      <p
        style={{
          fontFamily: "'Cormorant', serif",
          fontSize: "0.8rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#a8a29e",
        }}
      >
        — Bhavana Studio
      </p>
    </div>
  );
}

"use client";

interface ViewToggleProps {
  view: "table" | "cards";
  onChange: (view: "table" | "cards") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const buttonStyle = (isActive: boolean) => ({
    padding: "8px 12px",
    background: isActive ? "#0d1e30" : "#09131f",
    border: "1px solid #1e3a52",
    color: isActive ? "#a8d8ea" : "#6b8aad",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid #1e3a52",
      }}
    >
      <button
        onClick={() => onChange("table")}
        style={{
          ...buttonStyle(view === "table"),
          borderRight: "none",
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
        }}
        onMouseEnter={(e) => {
          if (view !== "table") {
            e.currentTarget.style.background = "#0a1520";
            e.currentTarget.style.color = "#a8c8e8";
          }
        }}
        onMouseLeave={(e) => {
          if (view !== "table") {
            e.currentTarget.style.background = "#09131f";
            e.currentTarget.style.color = "#6b8aad";
          }
        }}
        title="Table view"
      >
        <span style={{ fontSize: "1rem" }}>☰</span>
        <span
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}
        >
          Table
        </span>
      </button>
      <button
        onClick={() => onChange("cards")}
        style={{
          ...buttonStyle(view === "cards"),
          borderLeft: "none",
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
        }}
        onMouseEnter={(e) => {
          if (view !== "cards") {
            e.currentTarget.style.background = "#0a1520";
            e.currentTarget.style.color = "#a8c8e8";
          }
        }}
        onMouseLeave={(e) => {
          if (view !== "cards") {
            e.currentTarget.style.background = "#09131f";
            e.currentTarget.style.color = "#6b8aad";
          }
        }}
        title="Card view"
      >
        <span style={{ fontSize: "1rem" }}>▦</span>
        <span
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}
        >
          Cards
        </span>
      </button>
    </div>
  );
}

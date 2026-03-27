"use client";

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
}

export function SkeletonLoader({ rows = 5, columns = 7 }: SkeletonLoaderProps) {
  return (
    <div style={{ overflow: "hidden" }}>
      <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{ background: "#060d18", borderBottom: "1px solid #132030" }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                style={{
                  padding: 12,
                  textAlign: i === 0 ? "left" : i < 3 ? "left" : "right",
                }}
              >
                <div
                  className="skeleton-shimmer"
                  style={{
                    height: 16,
                    width: i === 0 ? 60 : i === 1 ? 120 : 80,
                    background:
                      "linear-gradient(90deg, #132030 25%, #1e3a52 50%, #132030 75%)",
                    backgroundSize: "200% 100%",
                    borderRadius: 4,
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                borderBottom: "1px solid #132030",
                background: rowIndex % 2 === 0 ? "#09131f" : "#060d18",
              }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: 12,
                    textAlign:
                      colIndex === 0 ? "left" : colIndex < 3 ? "left" : "right",
                  }}
                >
                  <div
                    className="skeleton-shimmer"
                    style={{
                      height: colIndex === 5 ? 24 : 14,
                      width:
                        colIndex === 0
                          ? 60
                          : colIndex === 1
                            ? 140
                            : colIndex === 5
                              ? 80
                              : 60,
                      background:
                        "linear-gradient(90deg, #132030 25%, #1e3a52 50%, #132030 75%)",
                      backgroundSize: "200% 100%",
                      borderRadius: colIndex === 5 ? 12 : 4,
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

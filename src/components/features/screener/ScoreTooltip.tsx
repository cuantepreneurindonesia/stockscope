"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreTooltipProps {
  breakdown?: {
    fundamental: number;
    technical: number;
    sentiment: number;
    liquidity: number;
  };
}

export function ScoreTooltip({ breakdown }: ScoreTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div
      ref={tooltipRef}
      style={{ position: "relative", display: "inline-block", marginLeft: 6 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "help",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          color: "#457b9d",
          fontSize: "0.875rem",
          transition: "color 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "#a8d8ea")}
        onMouseOut={(e) => (e.currentTarget.style.color = "#457b9d")}
        title="AI Score methodology"
      >
        ⓘ
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#060d18",
            border: "1px solid #457b9d",
            borderRadius: 8,
            padding: 16,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            minWidth: 320,
            maxWidth: 400,
            animation: "fadeIn 0.2s ease-in",
          }}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "6px solid #457b9d",
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: "#457b9d",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontWeight: 600,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: "1px solid #132030",
            }}
          >
            AI Score Methodology
          </div>

          {/* Factor Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Fundamental */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#e8f4f8",
                    fontWeight: 500,
                  }}
                >
                  Fundamental Analysis
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#457b9d",
                    fontWeight: 600,
                  }}
                >
                  35%
                </span>
              </div>
              {breakdown && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(69, 123, 157, 0.1)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${breakdown.fundamental}%`,
                        background: "#457b9d",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "'DM Mono', monospace",
                      color: "#a8c8e8",
                      minWidth: 30,
                    }}
                  >
                    {breakdown.fundamental}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#6b8aad",
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                P/E ratio, ROE, debt levels, profitability
              </p>
            </div>

            {/* Technical */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#e8f4f8",
                    fontWeight: 500,
                  }}
                >
                  Technical Analysis
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#457b9d",
                    fontWeight: 600,
                  }}
                >
                  30%
                </span>
              </div>
              {breakdown && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(69, 123, 157, 0.1)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${breakdown.technical}%`,
                        background: "#2a9d8f",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "'DM Mono', monospace",
                      color: "#a8c8e8",
                      minWidth: 30,
                    }}
                  >
                    {breakdown.technical}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#6b8aad",
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                Price trends, momentum, support/resistance
              </p>
            </div>

            {/* Sentiment */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#e8f4f8",
                    fontWeight: 500,
                  }}
                >
                  Market Sentiment
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#457b9d",
                    fontWeight: 600,
                  }}
                >
                  20%
                </span>
              </div>
              {breakdown && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(69, 123, 157, 0.1)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${breakdown.sentiment}%`,
                        background: "#e9c46a",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "'DM Mono', monospace",
                      color: "#a8c8e8",
                      minWidth: 30,
                    }}
                  >
                    {breakdown.sentiment}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#6b8aad",
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                Trading volume, institutional interest
              </p>
            </div>

            {/* Liquidity */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#e8f4f8",
                    fontWeight: 500,
                  }}
                >
                  Liquidity
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#457b9d",
                    fontWeight: 600,
                  }}
                >
                  15%
                </span>
              </div>
              {breakdown && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(69, 123, 157, 0.1)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${breakdown.liquidity}%`,
                        background: "#a8d8ea",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "'DM Mono', monospace",
                      color: "#a8c8e8",
                      minWidth: 30,
                    }}
                  >
                    {breakdown.liquidity}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#6b8aad",
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                Bid-ask spread, market depth, turnover
              </p>
            </div>
          </div>

          {/* Score Legend */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: "1px solid #132030",
            }}
          >
            <div
              style={{
                fontSize: "0.625rem",
                fontFamily: "'DM Mono', monospace",
                color: "#457b9d",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Score Tiers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#2a9d8f",
                    fontWeight: 600,
                  }}
                >
                  STRONG BUY
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#6b8aad",
                  }}
                >
                  80-100
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#457b9d",
                    fontWeight: 600,
                  }}
                >
                  BUY
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#6b8aad",
                  }}
                >
                  65-79
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#e9c46a",
                    fontWeight: 600,
                  }}
                >
                  WATCH
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#6b8aad",
                  }}
                >
                  50-64
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b8aad",
                    fontWeight: 600,
                  }}
                >
                  NEUTRAL
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#6b8aad",
                  }}
                >
                  35-49
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#e76f51",
                    fontWeight: 600,
                  }}
                >
                  AVOID
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "#6b8aad",
                  }}
                >
                  0-34
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

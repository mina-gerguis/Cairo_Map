"use client";

import React from "react";
import { parseWorkingHours, DAYS_OF_WEEK } from "@/lib/workingHours";
import { PlaceWorkingHoursCardProps } from "../types";

export default function PlaceWorkingHoursCard({
  workingHours,
}: PlaceWorkingHoursCardProps) {
  if (!workingHours) return null;

  const parsed = parseWorkingHours(workingHours);

  return (
    <div style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}
      >
        ساعات العمل
      </h3>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--border-glass)",
          borderRadius: "14px",
          padding: "16px 12px",
        }}
      >
        {!parsed ? (
          <div style={{ color: "var(--text-secondary)" }}>{workingHours}</div>
        ) : parsed.type === "24/7" ? (
          <div
            style={{
              color: "var(--colorSuccess)",
              fontWeight: "bold",
              background: "rgba(52, 199, 89, 0.1)",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            مفتوح طول أيام الأسبوع 24 ساعة
          </div>
        ) : parsed.type === "custom" && parsed.schedule ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {parsed.schedule.map((day) => {
              const todayName = DAYS_OF_WEEK[new Date().getDay()];
              const isToday = day.day === todayName;
              return (
                <div
                  key={day.day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: isToday
                      ? "rgba(47, 128, 237, 0.1)"
                      : "rgba(120, 120, 120, 0.04)",
                    border: isToday
                      ? "1px solid rgba(47, 128, 237, 0.3)"
                      : "1px solid transparent",
                  }}
                >
                  <div
                    style={{
                      fontWeight: isToday ? "bold" : "normal",
                      color: isToday
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {day.day}{" "}
                    {isToday && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-secondary)",
                          marginRight: "6px",
                        }}
                      >
                        (اليوم)
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: day.isWorking ? "var(--text-primary)" : "#ff3b30",
                      fontSize: "0.95rem",
                    }}
                  >
                    {day.isWorking
                      ? ` ${day.openTime} ${day.openPeriod} : ${day.closeTime} ${day.closePeriod}`
                      : "إجازة"}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

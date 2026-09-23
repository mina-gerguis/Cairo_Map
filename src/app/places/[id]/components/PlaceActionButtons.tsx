"use client";

import React from "react";
import { BiSolidMapPin } from "react-icons/bi";
import { FaPhoneAlt } from "react-icons/fa";
import { GrFavorite } from "react-icons/gr";
import { MdOutlineFavorite } from "react-icons/md";
import { PlaceActionButtonsProps } from "../types";

export default function PlaceActionButtons({
  displayBranch,
  isFavorite,
  togglingFav,
  toggleFavorite,
}: PlaceActionButtonsProps) {
  const directionsUrl =
    displayBranch.googleMapsUrl ||
    (displayBranch.latitude && displayBranch.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${displayBranch.latitude},${displayBranch.longitude}`
      : "#");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {/* Directions */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#007aff",
          color: "#fff",
          borderRadius: "12px",
          padding: "5px 6px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          cursor: "pointer",
          textDecoration: "none",
          textAlign: "center",
          transition: "opacity 0.2s",
        }}
      >
        <BiSolidMapPin style={{ fontSize: "1rem" }} />
        <span style={{ fontSize: "0.7rem", fontWeight: "bold" }}>
          الاتجاهات
        </span>
      </a>

      {/* Call */}
      {displayBranch.phones && displayBranch.phones.length > 0 ? (
        <a
          href={`tel:${displayBranch.phones[0]}`}
          style={{
            background: "rgba(0, 45, 248, 0.05)",
            border: "1px solid var(--border-glass)",
            color: "#007aff",
            borderRadius: "12px",
            padding: "5px 6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer",
            textDecoration: "none",
            textAlign: "center",
            transition: "opacity 0.2s",
          }}
        >
          <FaPhoneAlt style={{ fontSize: "1rem" }} />
          <span style={{ fontSize: "0.7rem", fontWeight: "500" }}>الهاتف</span>
        </a>
      ) : (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-glass)",
            color: "var(--text-muted)",
            borderRadius: "12px",
            padding: "5px 6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            opacity: 0.5,
            textAlign: "center",
          }}
        >
          <i className="bx bx-phone-off" style={{ fontSize: "1rem" }}></i>
          <span style={{ fontSize: "0.7rem", fontWeight: "500" }}>
            لا يتوفر
          </span>
        </div>
      )}

      {/* Favorite */}
      <button
        onClick={toggleFavorite}
        disabled={togglingFav}
        style={{
          background: "rgba(0, 45, 248, 0.05)",
          border: "1px solid var(--border-glass)",
          color: isFavorite ? "#ff3b30" : "#007aff",
          borderRadius: "12px",
          padding: "5px 6px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
      >
        {isFavorite ? (
          <MdOutlineFavorite style={{ fontSize: "1rem" }} />
        ) : (
          <GrFavorite style={{ fontSize: "1rem" }} />
        )}
        <span
          style={{
            fontFamily: "var(--font-cairo)",
            fontSize: "0.7rem",
            fontWeight: "500",
          }}
        >
          المفضلة
        </span>
      </button>
    </div>
  );
}

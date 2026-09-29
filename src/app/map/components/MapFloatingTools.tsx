"use client";

import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { MapLayerType } from "../types";
import { FaLocationArrow, FaPlus, FaMinus, FaLayerGroup } from "react-icons/fa";
import { TbFocusCentered } from "react-icons/tb";
import styles from "../map.module.css";

interface MapFloatingToolsProps {
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  mapLayer: MapLayerType;
  setMapLayer: (layer: MapLayerType) => void;
  onLocateUser: () => void;
  locationLoading: boolean;
  userHasLocation: boolean;
}

export default function MapFloatingTools({
  mapInstanceRef,
  mapLayer,
  setMapLayer,
  onLocateUser,
  locationLoading,
  userHasLocation,
}: MapFloatingToolsProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layerMenuRef.current &&
        !layerMenuRef.current.contains(event.target as Node)
      ) {
        setShowLayerMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo([30.0444, 31.2357], 12, { duration: 0.8 });
  };

  return (
    <div className={styles.mapToolsPanel}>
      {/* Locate Me Button */}
      <button
        className={`${styles.toolButton} ${userHasLocation ? styles.active : ""}`}
        onClick={onLocateUser}
        title="تحديد موقعي الحالي"
        disabled={locationLoading}
      >
        <FaLocationArrow
          style={{
            transform: "rotate(-45deg)",
            fontSize: "1.1rem",
            animation: locationLoading ? "spin 1s linear infinite" : "none",
          }}
        />
        {locationLoading && <div className={styles.locateBtnPulse} />}
      </button>

      {/* Recenter Cairo */}
      <button
        className={styles.toolButton}
        onClick={handleResetCenter}
        title="إعادة ضبط مركز الخريطة (القاهرة)"
      >
        <TbFocusCentered style={{ fontSize: "1.3rem" }} />
      </button>

      {/* Layer Picker Button */}
      <div style={{ position: "relative" }} ref={layerMenuRef}>
        <button
          className={`${styles.toolButton} ${showLayerMenu ? styles.active : ""}`}
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          title="تغيير نوع وطبقة الخريطة"
        >
          <FaLayerGroup style={{ fontSize: "1.1rem" }} />
        </button>

        {showLayerMenu && (
          <div className={styles.layerSelectorDropdown}>
            <button
              className={`${styles.layerOption} ${mapLayer === "dark" ? styles.selected : ""}`}
              onClick={() => {
                setMapLayer("dark");
                setShowLayerMenu(false);
              }}
            >
              <span>🌙</span>
              <span>خريطة ليلية (Dark)</span>
            </button>

            <button
              className={`${styles.layerOption} ${mapLayer === "light" ? styles.selected : ""}`}
              onClick={() => {
                setMapLayer("light");
                setShowLayerMenu(false);
              }}
            >
              <span>☀️</span>
              <span>خريطة نهارية (Light)</span>
            </button>

            <button
              className={`${styles.layerOption} ${mapLayer === "satellite" ? styles.selected : ""}`}
              onClick={() => {
                setMapLayer("satellite");
                setShowLayerMenu(false);
              }}
            >
              <span>🛰️</span>
              <span>قمر صناعي (Satellite)</span>
            </button>

            <button
              className={`${styles.layerOption} ${mapLayer === "streets" ? styles.selected : ""}`}
              onClick={() => {
                setMapLayer("streets");
                setShowLayerMenu(false);
              }}
            >
              <span>🗺️</span>
              <span>شوارع عامة (OpenStreet)</span>
            </button>
          </div>
        )}
      </div>

      {/* Zoom In */}
      <button
        className={styles.toolButton}
        onClick={handleZoomIn}
        title="تكبير الخريطة"
      >
        <FaPlus style={{ fontSize: "0.95rem" }} />
      </button>

      {/* Zoom Out */}
      <button
        className={styles.toolButton}
        onClick={handleZoomOut}
        title="تصغير الخريطة"
      >
        <FaMinus style={{ fontSize: "0.95rem" }} />
      </button>
    </div>
  );
}

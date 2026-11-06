"use client";

import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { MapLayerType, UserLocation } from "../types";
import {
  FaLocationArrow,
  FaPlus,
  FaMinus,
  FaLayerGroup,
  FaMapPin,
  FaCompass,
  FaBookmark,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { TbFocusCentered } from "react-icons/tb";
import styles from "../map.module.css";

const POPULAR_DISTRICTS = [
  { name: "وسط البلد / التحرير", lat: 30.0444, lng: 31.2357 },
  { name: "مصر الجديدة / الكوربة", lat: 30.0911, lng: 31.3256 },
  { name: "مدينة نصر / عباس العقاد", lat: 30.0617, lng: 31.3364 },
  { name: "التجمع الخامس / التسعين", lat: 30.0074, lng: 31.4285 },
  { name: "العاصمة الإدارية الجديدة", lat: 30.0131, lng: 31.7456 },
  { name: "المعادي / دجلة", lat: 29.9602, lng: 31.2569 },
  { name: "الشيخ زايد", lat: 30.0488, lng: 30.9856 },
  { name: "6 أكتوبر / الحصري", lat: 29.9723, lng: 30.9431 },
  { name: "المهندسين / جامعة الدول", lat: 30.0521, lng: 31.2012 },
  { name: "الدقي / مصدق", lat: 30.0384, lng: 31.2115 },
  { name: "الزمالك", lat: 30.0619, lng: 31.2198 },
  { name: "شبرا مصر", lat: 30.0768, lng: 31.2464 },
  { name: "الهرم / فيصل", lat: 29.9975, lng: 31.1554 },
  { name: "الرحاب ومدينتي", lat: 30.0613, lng: 31.4923 },
  { name: "المقطم / الهضبة الوسطى", lat: 30.0077, lng: 31.3008 },
  { name: "الشروق", lat: 30.1388, lng: 31.6231 },
  { name: "حلوان", lat: 29.8497, lng: 31.3342 },
  { name: "الإسكندرية / الرمل", lat: 31.2001, lng: 29.9187 },
];

interface MapFloatingToolsProps {
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  mapLayer: MapLayerType;
  setMapLayer: (layer: MapLayerType) => void;
  onLocateUser: () => void;
  locationLoading: boolean;
  userHasLocation: boolean;
  onSelectDistrict?: (loc: UserLocation) => void;
  onSaveLocation?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function MapFloatingTools({
  mapInstanceRef,
  mapLayer,
  setMapLayer,
  onLocateUser,
  locationLoading,
  userHasLocation,
  onSelectDistrict,
  onSaveLocation,
  isFullscreen,
  onToggleFullscreen,
}: MapFloatingToolsProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  const districtMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layerMenuRef.current &&
        !layerMenuRef.current.contains(event.target as Node)
      ) {
        setShowLayerMenu(false);
      }
      if (
        districtMenuRef.current &&
        !districtMenuRef.current.contains(event.target as Node)
      ) {
        setShowDistrictMenu(false);
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
      {/* Fullscreen Mode Toggle */}
      {onToggleFullscreen && (
        <button
          className={`${styles.toolButton} ${isFullscreen ? styles.active : ""}`}
          onClick={onToggleFullscreen}
          title={isFullscreen ? "إنهاء وضع ملء الشاشة (ESC)" : "ملء الشاشة الكامل (F)"}
          style={
            isFullscreen
              ? {
                  background: "var(--color-primary, #2563eb)",
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 0 16px rgba(37, 99, 235, 0.6)",
                }
              : undefined
          }
        >
          {isFullscreen ? (
            <FaCompress style={{ fontSize: "1.05rem" }} />
          ) : (
            <FaExpand style={{ fontSize: "1.05rem" }} />
          )}
        </button>
      )}

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

      {/* Save My Location Button */}
      {onSaveLocation && (
        <button
          className={styles.toolButton}
          onClick={onSaveLocation}
          title="أحفظ مكاني (GPS دقيق ورابط Google Maps)"
          style={{ color: "#38bdf8" }}
        >
          <FaBookmark style={{ fontSize: "1.05rem" }} />
        </button>
      )}

      {/* Quick Egyptian Districts / Areas Picker */}
      <div style={{ position: "relative" }} ref={districtMenuRef}>
        <button
          className={`${styles.toolButton} ${showDistrictMenu ? styles.active : ""}`}
          onClick={() => setShowDistrictMenu(!showDistrictMenu)}
          title="اختيار وتحديد منطقتك / حيك بدقة"
        >
          <FaMapPin style={{ fontSize: "1.1rem" }} />
        </button>

        {showDistrictMenu && (
          <div
            className={styles.layerSelectorDropdown}
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              minWidth: "180px",
            }}
          >
            <div
              style={{
                padding: "4px 8px 6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                borderBottom: "1px solid var(--border-glass, rgba(255,255,255,0.08))",
                marginBottom: "4px",
              }}
            >
              📍 حدد منطقتك بدقة:
            </div>
            {POPULAR_DISTRICTS.map((d) => (
              <button
                key={d.name}
                className={styles.layerOption}
                onClick={() => {
                  if (onSelectDistrict) {
                    onSelectDistrict({
                      lat: d.lat,
                      lng: d.lng,
                      accuracy: 10,
                      timestamp: Date.now(),
                    });
                  }
                  mapInstanceRef.current?.flyTo([d.lat, d.lng], 15, {
                    duration: 0.9,
                  });
                  setShowDistrictMenu(false);
                }}
              >
                <span>🏙️</span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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
              className={`${styles.layerOption} ${mapLayer === "light" ? styles.selected : ""}`}
              onClick={() => {
                setMapLayer("light");
                setShowLayerMenu(false);
              }}
            >
              <span>☀️</span>
              <span>خريطة نهارية ملونة (Light)</span>
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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaSun,
  FaCloudSun,
  FaSnowflake,
  FaCloudRain,
  FaMapMarkerAlt,
  FaSpinner,
  FaLocationArrow,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import LocationHelperModal from "./LocationHelperModal";

interface WeatherData {
  temp: number;
  text: string;
  tip: string;
  icon: "hot" | "mild" | "cool" | "cold" | "rain";
  locationName: string;
}

export default function WeatherComfortWidget() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locating, setLocating] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [showHelperModal, setShowHelperModal] = useState<boolean>(false);

  const fetchWeatherData = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoading(true);
        setPermissionDenied(false);

        // 1. Fetch live weather from Open-Meteo API
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day,relative_humidity_2m`
        );

        let temp = 28;
        let weatherCode = 0;

        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          if (wData.current) {
            temp = Math.round(wData.current.temperature_2m);
            weatherCode = wData.current.weather_code ?? 0;
          }
        }

        // 2. Fetch location city/locality name in Arabic
        let locationName = "موقعك الحالي";
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city =
              geoData.city ||
              geoData.locality ||
              geoData.principalSubdivision ||
              geoData.countryName;
            if (city) {
              locationName = city;
            }
          }
        } catch {
          // Keep default location name if reverse geocoding fails
        }

        // 3. Determine icon, text, and commute tips based on WMO weather code & temperature
        const isRain =
          (weatherCode >= 51 && weatherCode <= 67) ||
          (weatherCode >= 80 && weatherCode <= 82) ||
          (weatherCode >= 95 && weatherCode <= 99);

        let icon: "hot" | "mild" | "cool" | "cold" | "rain" = "mild";
        let text = "معتدل";
        let tip = `الطقس معتدل ومناسب لكافة وسائل المواصلات في ${locationName}.`;

        if (isRain) {
          icon = "rain";
          text = "أمطار";
          tip = `يتوقع هطول أمطار في ${locationName} - يُوصى بالاعتماد على المترو أو الوسائل المغطاة والاحتفاظ بمظلة.`;
        } else if (temp >= 32) {
          icon = "hot";
          text = "حار جدًا";
          tip = `الجو حار اليوم في ${locationName} (${temp}° م) - نوصيك باستخدام المترو المكيف أو القطار الكهربائي LRT للتنقل براحة.`;
        } else if (temp >= 28) {
          icon = "hot";
          text = "حار نسبياً";
          tip = `الجو حار في ${locationName} (${temp}° م) - نوصيك بشرب كمية كافية من الماء واستخدام الوسائل المكيفة.`;
        } else if (temp >= 20) {
          icon = "mild";
          text = "معتدل ولطيف";
          tip = `الطقس ممتاز ولطيف اليوم في ${locationName} (${temp}° م) للتنقل بكافة وسائل المواصلات.`;
        } else if (temp >= 14) {
          icon = "cool";
          text = "مائل للبرودة";
          tip = `الجو مائل للبرودة في ${locationName} (${temp}° م) - ينصح بارتداء جاكيت خفيف أثناء انتظار المواصلات.`;
        } else {
          icon = "cold";
          text = "بارد";
          tip = `الجو بارد في ${locationName} (${temp}° م) - ارتداء ملابس دافئة يضمن لك تنقلاً مريحاً.`;
        }

        setWeather({
          temp,
          text,
          tip,
          icon,
          locationName,
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
        setPermissionDenied(true);
        setWeather(null);
      } finally {
        setLoading(false);
        setLocating(false);
      }
    },
    []
  );

  const requestUserLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setPermissionDenied(true);
      setLoading(false);
      setWeather(null);
      return;
    }

    setLocating(true);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err.message);
        setPermissionDenied(true);
        setWeather(null);
        setLoading(false);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [fetchWeatherData]);

  useEffect(() => {
    setMounted(true);
    // Check initial permission status if available
    if (typeof window !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") {
            setPermissionDenied(true);
            setLoading(false);
          } else {
            requestUserLocation();
          }
        })
        .catch(() => {
          requestUserLocation();
        });
    } else {
      requestUserLocation();
    }
  }, [requestUserLocation]);

  // Handle location modal success callback
  const handleModalSuccess = (lat: number, lng: number) => {
    fetchWeatherData(lat, lng);
  };

  if (!mounted) {
    return null;
  }

  // 1. Loading State
  if (loading && !weather && !permissionDenied) {
    return (
      <div
        style={{
          background: "var(--bgAlert)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "14px",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          direction: "rtl",
          color: "var(--textSecondary)",
          fontSize: "0.85rem",
        }}
      >
        <FaSpinner className="weather-spin" style={{ fontSize: "1.2rem", color: "#f59e0b" }} />
        <span>جاري تحديد موقعك وجلب درجة الحرارة...</span>
        <style jsx>{`
          @keyframes spinWeather {
            to {
              transform: rotate(360deg);
            }
          }
          .weather-spin {
            animation: spinWeather 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // 2. Permission Denied State (NO weather shown, instructions provided)
  if (permissionDenied || (!weather && !loading)) {
    return (
      <>
        <div
          style={{
            background: "var(--bgAlert)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "var(--radius-xs)",
            padding: "14px 18px",
            marginBottom: "20px",
            direction: "rtl",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "2px",
              }}
            >
              <img src="images/icons3d/alert.png" alt="alert icon" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-sub)" }}>
                <span>درجة الحرارة غير متاحة (الموقع غير مفعل)</span>
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                لعرض درجة الحرارة وحالة الطقس الخاصة بموقعك الحالي، يرجى تفعيل السماح بالوصول للموقع الجغرافي (GPS) في متصفحك.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={requestUserLocation}
                  disabled={locating}
                  className="btn btn-primary"
                  style={{
                    cursor: locating ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-sub)",
                    width: "100%",
                  }}
                >
                  {locating ? (
                    <FaSpinner className="weather-spin" style={{ fontSize: "0.85rem" }} />
                  ) : (
                    <FaLocationArrow style={{ fontSize: "0.75rem" }} />
                  )}
                  <span>{locating ? "جاري التحديد..." : "تفعيل وإعادة المحاولة"}</span>
                </button>

                <button
                  onClick={() => setShowHelperModal(true)}
                  style={{
                    background: "var(--secondBtn)",
                    border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.15))",
                    color: "var(--textPrimary)",
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    fontFamily: "var(--font-sub)",
                    transition: "background 0.2s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                >
                  <FaInfoCircle style={{ color: "#6c63ff", fontSize: "0.85rem" }} />
                  <span>طريقة تفعيل الموقع (تعليمات)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <LocationHelperModal
          isOpen={showHelperModal}
          onClose={() => setShowHelperModal(false)}
          onSuccess={handleModalSuccess}
        />

        <style jsx>{`
          @keyframes spinWeather {
            to {
              transform: rotate(360deg);
            }
          }
          .weather-spin {
            animation: spinWeather 1s linear infinite;
          }
        `}</style>
      </>
    );
  }

  if (!weather) return null;

  // 3. Location Granted & Weather Active State
  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(179, 179, 179, 0.12) 0%, rgba(95, 95, 95, 0.08) 100%)",
          border: "1px solid rgba(136, 136, 136, 0.3)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
          <div
            style={{
              background: "none",
              color:
                weather.icon === "rain"
                  ? "#3b83f63b"
                  : weather.icon === "cold" || weather.icon === "cool"
                    ? "#06b5d43d"
                    : "#f59f0b2a",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.3rem",
              flexShrink: 0,
            }}
          >
            {weather.icon === "hot" ? (
              <img src="images/icons3d/sun.png" alt="hot icon" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : weather.icon === "rain" ? (
              <img src="images/icons3d/cloud_rain.png" alt="rain icon" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : weather.icon === "cold" || weather.icon === "cool" ? (
              <img src="images/icons3d/snowflake.png" alt="snow icon" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src="images/icons3d/cloud.png" alt="cloud icon" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "0.88rem",
                fontWeight: "700",
                color: "var(--textPrimary)",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <span style={{ display: "inline-block", alignItems: "center", gap: "4px" }}>
                الطقس في مدينة {weather.locationName} <span style={{
                  color:
                    weather.icon === "rain"
                      ? "#0004ffff"
                      : weather.icon === "cold" || weather.icon === "cool"
                        ? "rgba(0, 188, 221, 1)"
                        : "#f50b0bff",
                  fontSize: "0.75rem"
                }}>{weather.text} </span>: <strong>{weather.temp}° م</strong>
              </span>

            </div>
            <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "var(--textSecondary)", lineHeight: "1.4" }}>
              {weather.tip}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={requestUserLocation}
            disabled={locating}
            title="تحديث درجة الحرارة بناءً على موقعك الحالي"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "var(--textPrimary)",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: locating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            {locating ? (
              <FaSpinner className="weather-spin" style={{ fontSize: "0.9rem", color: "var(--color-blue-700)" }} />
            ) : (
              <FaLocationArrow style={{ fontSize: "0.9rem", color: "var(--color-blue-700)" }} />
            )}
          </button>
        </div>
      </div>

      <LocationHelperModal
        isOpen={showHelperModal}
        onClose={() => setShowHelperModal(false)}
        onSuccess={handleModalSuccess}
      />

      <style jsx>{`
        @keyframes spinWeather {
          to {
            transform: rotate(360deg);
          }
        }
        .weather-spin {
          animation: spinWeather 1s linear infinite;
        }
      `}</style>
    </>
  );
}

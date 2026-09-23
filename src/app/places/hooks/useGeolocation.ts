"use client";

import { useState, useCallback } from "react";
import { UserLocation } from "../types";

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [isProximityEnabled, setIsProximityEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLocationHelperOpen, setIsLocationHelperOpen] = useState(false);

  const handleLocationSuccess = useCallback((lat: number, lng: number) => {
    setUserLocation({ latitude: lat, longitude: lng });
    setIsProximityEnabled(true);
    setLocationLoading(false);
  }, []);

  const handleToggleProximity = useCallback(() => {
    if (isProximityEnabled) {
      setIsProximityEnabled(false);
      setUserLocation(null);
      return;
    }

    if (typeof window === "undefined" || !navigator.geolocation) {
      setIsLocationHelperOpen(true);
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsProximityEnabled(true);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setIsLocationHelperOpen(true);
        } else {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              alert("تم رفض طلب تحديد الموقع.");
              break;
            case err.POSITION_UNAVAILABLE:
              alert("معلومات الموقع غير متوفرة.");
              break;
            default:
              alert("حدث خطأ أثناء تحديد موقعك.");
          }
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [isProximityEnabled]);

  return {
    userLocation,
    isProximityEnabled,
    locationLoading,
    isLocationHelperOpen,
    setIsLocationHelperOpen,
    handleLocationSuccess,
    handleToggleProximity,
  };
}

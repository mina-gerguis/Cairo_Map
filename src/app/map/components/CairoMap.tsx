"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPlacePoint, UserLocation, MapLayerType } from "../types";
import { getCategoryColor, CATEGORY_EMOJIS } from "@/app/places/constants";
import styles from "../map.module.css";

interface CairoMapProps {
  points: MapPlacePoint[];
  selectedPoint: MapPlacePoint | null;
  onSelectPoint: (point: MapPlacePoint | null) => void;
  userLocation: UserLocation | null;
  mapLayer: MapLayerType;
  isLight: boolean;
  mapInstanceRef?: React.MutableRefObject<L.Map | null>;
  searchQuery?: string;
}

const TILE_URLS: Record<MapLayerType, { url: string; attribution: string; subdomains?: string }> = {
  dark: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  light: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    subdomains: "abc",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
  },
};

export default function CairoMap({
  points,
  selectedPoint,
  onSelectPoint,
  userLocation,
  mapLayer,
  isLight,
  mapInstanceRef,
  searchQuery = "",
}: CairoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const internalMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Default Cairo coordinates
  const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];
  const DEFAULT_ZOOM = 12;

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || internalMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    internalMapRef.current = map;
    if (mapInstanceRef) {
      mapInstanceRef.current = map;
    }

    markersLayerRef.current = L.layerGroup().addTo(map);

    // Initial tile layer
    const activeLayerKey: MapLayerType = mapLayer || (isLight ? "light" : "dark");
    const tileConfig = TILE_URLS[activeLayerKey] || TILE_URLS.dark;
    
    if (activeLayerKey === "dark") {
      mapContainerRef.current.classList.add("map-dark-tiles");
    } else {
      mapContainerRef.current.classList.remove("map-dark-tiles");
    }

    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: tileConfig.subdomains || "abc",
      className: activeLayerKey === "dark" ? "dark-tile-img" : "",
    }).addTo(map);

    // Close selected point when clicking on empty map
    map.on("click", (e) => {
      const originalTarget = (e.originalEvent?.target as HTMLElement) || null;
      if (
        !originalTarget?.closest(".cairo-custom-marker") &&
        !originalTarget?.closest(`.${styles.selectedPlaceFloatingCard}`)
      ) {
        onSelectPoint(null);
      }
    });

    return () => {
      map.remove();
      internalMapRef.current = null;
      if (mapInstanceRef) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Tile Layer on Layer or Theme change
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    let targetLayerKey = mapLayer;
    // If not specified or user selected automatic theme matching
    if (targetLayerKey === "dark" && isLight) targetLayerKey = "light";
    if (targetLayerKey === "light" && !isLight) targetLayerKey = "dark";

    const tileConfig = TILE_URLS[targetLayerKey] || TILE_URLS.dark;

    if (mapContainerRef.current) {
      if (targetLayerKey === "dark") {
        mapContainerRef.current.classList.add("map-dark-tiles");
      } else {
        mapContainerRef.current.classList.remove("map-dark-tiles");
      }
    }

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: tileConfig.subdomains || "abc",
      className: targetLayerKey === "dark" ? "dark-tile-img" : "",
    }).addTo(map);
  }, [mapLayer, isLight]);

  // 3. Render Custom Place Markers
  useEffect(() => {
    const map = internalMapRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    points.forEach((point) => {
      const color = getCategoryColor(point.category);
      const emoji = CATEGORY_EMOJIS[point.category] || "📍";
      const isSelected = selectedPoint?.id === point.id;

      const markerHtml = `
        <div class="cairo-custom-marker ${isSelected ? "active-marker" : ""}">
          <div class="marker-pin" style="background-color: ${color}; ${
        isSelected ? "border-color: #ffd700; box-shadow: 0 0 16px " + color : ""
      }">
            <span class="marker-pin-emoji">${emoji}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-marker-wrapper",
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        tooltipAnchor: [0, -38],
      });

      const marker = L.marker([point.latitude, point.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      // Tooltip
      const ratingHtml = point.rating
        ? `<span style="color:#fbbf24; margin-right:4px;">★ ${point.rating.toFixed(1)}</span>`
        : "";
      marker.bindTooltip(
        `<div style="display:flex; align-items:center; gap:6px;">
          <span>${point.name}${point.branchName ? ` - ${point.branchName}` : ""}</span>
          ${ratingHtml}
        </div>`,
        {
          direction: "top",
          className: "cairo-map-tooltip",
          offset: [0, -32],
        }
      );

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPoint(point);
        map.flyTo([point.latitude, point.longitude], Math.max(map.getZoom(), 15), {
          duration: 0.8,
        });
      });

      markersGroup.addLayer(marker);
    });
  }, [points, selectedPoint, onSelectPoint]);

  // 4. Update User Location Marker & Accuracy Circle
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
      return;
    }

    const userLatLng: [number, number] = [userLocation.lat, userLocation.lng];

    const userIconHtml = `
      <div class="user-location-marker">
        <div class="user-location-ring"></div>
        <div class="user-location-dot"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: "custom-user-marker",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLatLng);
    } else {
      userMarkerRef.current = L.marker(userLatLng, {
        icon: userIcon,
        zIndexOffset: 2000,
      }).addTo(map);

      userMarkerRef.current.bindTooltip(
        '<div style="font-weight:700; color:#007aff;">📍 موقعك الحالي</div>',
        {
          direction: "top",
          className: "cairo-map-tooltip",
          offset: [0, -12],
        }
      );
    }

    // Accuracy Circle
    if (userLocation.accuracy && userLocation.accuracy > 10) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng(userLatLng);
        accuracyCircleRef.current.setRadius(userLocation.accuracy);
      } else {
        accuracyCircleRef.current = L.circle(userLatLng, {
          radius: userLocation.accuracy,
          color: "#007aff",
          weight: 1,
          fillColor: "#007aff",
          fillOpacity: 0.12,
        }).addTo(map);
      }
    }
  }, [userLocation]);

  // 5. Draw Direction Line to Selected Point
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (userLocation && selectedPoint) {
      const latlngs: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        [selectedPoint.latitude, selectedPoint.longitude],
      ];

      routeLineRef.current = L.polyline(latlngs, {
        color: "#3b82f6",
        weight: 3,
        dashArray: "8, 8",
        opacity: 0.8,
      }).addTo(map);
    }
  }, [userLocation, selectedPoint]);

  // 6. Fly to Selected Point when changed externally
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map || !selectedPoint) return;

    map.flyTo([selectedPoint.latitude, selectedPoint.longitude], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
  }, [selectedPoint]);

  // 7. Auto-navigate map camera based on search typing
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    const query = searchQuery.trim();
    if (!query) return;

    // A. If NO places matched what is typed -> Zoom out to show full Cairo overview
    if (points.length === 0) {
      onSelectPoint(null);
      map.flyTo(DEFAULT_CENTER, 10.5, {
        duration: 1.0,
      });
      return;
    }

    // B. If exactly 1 place matched -> Fly directly to it and select it
    if (points.length === 1) {
      const single = points[0];
      onSelectPoint(single);
      map.flyTo([single.latitude, single.longitude], 16, {
        duration: 0.8,
      });
      return;
    }

    // C. If multiple places matched -> Select closest/first one and fit bounds to show all
    if (points.length > 1) {
      onSelectPoint(points[0]);

      const latLngs = points.map((p) => [p.latitude, p.longitude] as [number, number]);
      const bounds = L.latLngBounds(latLngs);

      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
        duration: 0.8,
      });
    }
  }, [searchQuery, points]);

  return <div ref={mapContainerRef} className={styles.mapCanvas} />;
}

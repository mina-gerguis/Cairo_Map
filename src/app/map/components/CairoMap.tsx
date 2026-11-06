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
  onUpdateUserLocation?: (loc: UserLocation) => void;
}

const TILE_URLS: Record<MapLayerType, { url: string; attribution: string; subdomains?: string; maxZoom?: number }> = {
  dark: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  light: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    subdomains: "abc",
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
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
  onUpdateUserLocation,
}: CairoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const internalMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const distanceMarkerRef = useRef<L.Marker | null>(null);

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

    // Initial tile layer (Always Light by default)
    const activeLayerKey: MapLayerType = mapLayer === "dark" ? "light" : (mapLayer || "light");
    const tileConfig = TILE_URLS[activeLayerKey] || TILE_URLS.light;
    
    mapContainerRef.current.classList.remove("map-dark-tiles");

    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom || 19,
      subdomains: tileConfig.subdomains || "abc",
      className: "",
    }).addTo(map);

    // Update zoom detailed class
    const updateZoomClass = () => {
      if (map.getZoom() >= 14) {
        mapContainerRef.current?.classList.add("cairo-map-zoom-detailed");
      } else {
        mapContainerRef.current?.classList.remove("cairo-map-zoom-detailed");
      }
    };
    map.on("zoomend", updateZoomClass);
    updateZoomClass();

    // Resize observer to ensure full height & width tiles refresh
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

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
      resizeObserver.disconnect();
      map.remove();
      internalMapRef.current = null;
      if (mapInstanceRef) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Tile Layer on Layer change (Exclusively Light modes)
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    const targetLayerKey: MapLayerType = mapLayer === "dark" ? "light" : (mapLayer || "light");
    const tileConfig = TILE_URLS[targetLayerKey] || TILE_URLS.light;

    if (mapContainerRef.current) {
      mapContainerRef.current.classList.remove("map-dark-tiles");
    }

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom || 19,
      subdomains: tileConfig.subdomains || "abc",
      className: "",
    }).addTo(map);
  }, [mapLayer]);

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
          <div class="marker-pin-outer" style="--pin-color: ${color};">
            <div class="marker-pin-pulse"></div>
            <div class="marker-pin-body">
              <span class="marker-pin-emoji">${emoji}</span>
              ${
                point.rating && point.rating >= 4.0
                  ? `<span class="marker-rating-tag">★${point.rating.toFixed(1)}</span>`
                  : ""
              }
            </div>
            <div class="marker-pin-tip"></div>
          </div>
          <div class="marker-title-badge">${point.name}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-marker-wrapper",
        iconSize: [42, 46],
        iconAnchor: [21, 46],
        tooltipAnchor: [0, -46],
      });

      const marker = L.marker([point.latitude, point.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 10000 : 0,
      });

      // Rich Tooltip positioned snug right above the pin
      const ratingHtml = point.rating
        ? `<span class="cairo-tooltip-rating">★ ${point.rating.toFixed(1)}</span>`
        : "";
      marker.bindTooltip(
        `<div class="cairo-tooltip-box">
          <div class="cairo-tooltip-title-row">
            <span class="cairo-tooltip-name">${point.name}${point.branchName ? ` - ${point.branchName}` : ""}</span>
            ${ratingHtml}
          </div>
          <div class="cairo-tooltip-sub-row">
            <span style="color: ${color}; font-weight: 700;">${emoji} ${point.categoryLabel}</span>
            ${typeof point.distanceKm === "number" ? `<span class="cairo-tooltip-dist">${point.distanceKm < 1 ? Math.round(point.distanceKm * 1000) + " م" : point.distanceKm.toFixed(1) + " كم"}</span>` : ""}
          </div>
        </div>`,
        {
          direction: "top",
          className: "cairo-map-tooltip",
          offset: [0, -4],
          interactive: false,
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
        draggable: true,
      }).addTo(map);

      userMarkerRef.current.bindTooltip(
        '<div style="font-weight:700; color:#007aff; text-align:center;">📍 موقعك الحالي<br/><span style="font-size:0.7rem; color:#a1a1aa; font-weight:normal;">اسحب العلامة لضبط مكانك بدقة 🎯</span></div>',
        {
          direction: "top",
          className: "cairo-map-tooltip",
          offset: [0, -12],
        }
      );

      userMarkerRef.current.on("dragend", (e: any) => {
        const marker = e.target;
        const newPos = marker.getLatLng();
        if (onUpdateUserLocation) {
          onUpdateUserLocation({
            lat: Number(newPos.lat.toFixed(6)),
            lng: Number(newPos.lng.toFixed(6)),
            accuracy: 5,
            timestamp: Date.now(),
          });
        }
      });
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

  // 5. Draw Direction Line to Selected Point & Midpoint Distance Badge
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    if (distanceMarkerRef.current) {
      map.removeLayer(distanceMarkerRef.current);
      distanceMarkerRef.current = null;
    }

    if (userLocation && selectedPoint) {
      const latlngs: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        [selectedPoint.latitude, selectedPoint.longitude],
      ];

      routeLineRef.current = L.polyline(latlngs, {
        color: "#2563eb",
        weight: 3.5,
        dashArray: "6, 8",
        opacity: 0.85,
        className: "cairo-route-polyline",
      }).addTo(map);

      // Midpoint distance pill
      const midLat = (userLocation.lat + selectedPoint.latitude) / 2;
      const midLng = (userLocation.lng + selectedPoint.longitude) / 2;
      const dist = selectedPoint.distanceKm;

      if (typeof dist === "number") {
        const distStr = dist < 1 ? `${Math.round(dist * 1000)} م` : `${dist.toFixed(1)} كم`;
        const estMinutes = Math.max(2, Math.round((dist / 30) * 60));

        const distIcon = L.divIcon({
          html: `<div class="cairo-distance-midpoint-pill">📍 ${distStr} • 🚗 ${estMinutes} د</div>`,
          className: "custom-distance-badge-wrapper",
          iconSize: [140, 28],
          iconAnchor: [70, 14],
        });

        distanceMarkerRef.current = L.marker([midLat, midLng], {
          icon: distIcon,
          interactive: false,
          zIndexOffset: 1500,
        }).addTo(map);
      }
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

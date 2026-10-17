"use client";

import React, { useState } from "react";
import { Place, PlaceCategory } from "@/data/places";
import { AddPlaceModalProps } from "../types";
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from "../constants";

export default function AddPlaceModal({
  isOpen,
  onClose,
  onAddPlace,
}: AddPlaceModalProps) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<PlaceCategory>("restaurant");
  const [newBriefLocation, setNewBriefLocation] = useState("");
  const [newFullAddress, setNewFullAddress] = useState("");
  const [newPhones, setNewPhones] = useState("");
  const [newMapsUrl, setNewMapsUrl] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newWorkingHours, setNewWorkingHours] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBriefLocation.trim()) return;

    const newPlace: Place = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      categoryLabel: CATEGORY_LABELS[newCategory] || newCategory,
      subCategories: [newCategory],
      briefLocation: newBriefLocation.trim(),
      fullAddress: newFullAddress.trim(),
      phones: newPhones
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      googleMapsUrl: newMapsUrl.trim() || "https://maps.google.com",
      images: newImageUrl.trim() ? [newImageUrl.trim()] : [],
      description: newDescription.trim() || undefined,
      workingHours: newWorkingHours.trim() || undefined,
      latitude: newLat ? parseFloat(newLat) : undefined,
      longitude: newLng ? parseFloat(newLng) : undefined,
    };

    onAddPlace(newPlace);
    onClose();

    // Reset form
    setNewName("");
    setNewBriefLocation("");
    setNewFullAddress("");
    setNewPhones("");
    setNewMapsUrl("");
    setNewImageUrl("");
    setNewDescription("");
    setNewWorkingHours("");
    setNewLat("");
    setNewLng("");
  };

  return (
    <div className="ios-sheet-overlay" onClick={onClose}>
      <div className="ios-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ios-sheet-drag-handle" onClick={onClose} />
        <div className="ios-sheet-content">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: "800",
              marginBottom: "24px",
            }}
          >
            ➕ إضافة مكان جديد
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="اسم المكان *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <select
              className="input-fields help-select"
              style={{ paddingRight: "16px" }}
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as PlaceCategory)
              }
            >
              {(
                [
                  "restaurant",
                  "cafe",
                  "pharmacy",
                  "medicalCenter",
                  "garden",
                  "family",
                  "entertainment",
                  "work",
                ] as PlaceCategory[]
              ).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_EMOJIS[c]} {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="الموقع المختصر (مثال: مصر الجديدة) *"
              value={newBriefLocation}
              onChange={(e) => setNewBriefLocation(e.target.value)}
              required
            />
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="العنوان التفصيلي"
              value={newFullAddress}
              onChange={(e) => setNewFullAddress(e.target.value)}
            />
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="أرقام التليفون (افصل بفاصلة)"
              value={newPhones}
              onChange={(e) => setNewPhones(e.target.value)}
            />
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="رابط خرائط جوجل"
              value={newMapsUrl}
              onChange={(e) => setNewMapsUrl(e.target.value)}
            />
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="رابط صورة المكان"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <input
              className="input-fields"
              style={{ paddingRight: "16px" }}
              placeholder="مواعيد العمل"
              value={newWorkingHours}
              onChange={(e) => setNewWorkingHours(e.target.value)}
            />
            <textarea
              className="input-fields"
              style={{
                paddingRight: "16px",
                minHeight: "80px",
                resize: "vertical",
              }}
              placeholder="وصف المكان"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <input
                className="input-fields"
                style={{ paddingRight: "16px" }}
                placeholder="خط العرض (Lat)"
                value={newLat}
                onChange={(e) => setNewLat(e.target.value)}
                type="number"
                step="any"
              />
              <input
                className="input-fields"
                style={{ paddingRight: "16px" }}
                placeholder="خط الطول (Lng)"
                value={newLng}
                onChange={(e) => setNewLng(e.target.value)}
                type="number"
                step="any"
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                إضافة المكان
              </button>
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

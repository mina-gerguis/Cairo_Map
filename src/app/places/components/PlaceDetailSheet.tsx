"use client";

import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { BiSolidMapPin } from "react-icons/bi";
import { TbMapShare } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { MdOutlineIosShare } from "react-icons/md";
import ReviewSection from "@/components/ReviewSection";
import {
  parseWorkingHours,
  DAYS_OF_WEEK,
  isCurrentlyOpen,
} from "@/lib/workingHours";
import { FEATURES_LIST } from "@/data/places";
import { PlaceDetailSheetProps } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../constants";
import ImageWithSkeleton from "./ImageWithSkeleton";

export default function PlaceDetailSheet({
  selectedPlace,
  selectedBranchId,
  setSelectedBranchId,
  onClose,
  favoriteIds,
  toggleFavorite,
  onShare,
  onOpenReportModal,
  onOpenNoteModal,
  onMediaClick,
  hasAccess,
  onRatingUpdate,
}: PlaceDetailSheetProps) {
  const displayBranch =
    selectedPlace.branches?.find((b) => b.id === selectedBranchId) ||
    selectedPlace.branches?.find((b) => b.isMain) ||
    (selectedPlace.branches && selectedPlace.branches[0]) ||
    selectedPlace;

  const isFav = favoriteIds.has(selectedPlace.id.toString());

  const activeFeatures =
    (displayBranch as any).features || (selectedPlace as any).features;

  const branchServices =
    (displayBranch as any)?.services || (selectedPlace as any)?.services;

  const mediaList =
    displayBranch?.media && displayBranch.media.length > 0
      ? displayBranch.media
      : selectedPlace.menuImages || [];

  return (
    <div
      className="ios-sheet-overlay"
      onClick={onClose}
    >
      <div
        className="ios-sheet"
        style={{
          maxWidth: "100%",
          borderTopRightRadius: "25px",
          borderTopLeftRadius: "25px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ios-sheet-drag-handle" onClick={onClose} />

        {/* Apple Maps Top Bar (Fixed) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 24px",
            borderBottom: "1px solid var(--border-glass)",
            flexShrink: 0,
          }}
        >
          {/* Left: Share */}
          <button
            onClick={() => onShare(selectedPlace)}
            style={{
              background: "var(--color-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#ffffff",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
              transition: "all 0.2s",
            }}
            title="مشاركة المكان"
          >
            <TbMapShare />
          </button>

          {/* Center: Centered Place Name */}
          <div
            style={{
              textAlign: "center",
              flex: 1,
              minWidth: 0,
              padding: "0 10px",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: "bold",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "var(--text-primary)",
              }}
            >
              {selectedPlace.name}
            </h2>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "flex",
                gap: "5px",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span>
                {selectedPlace.categoryLabel ||
                  CATEGORY_LABELS[selectedPlace.category]}
              </span>
              {selectedPlace.subCategories &&
                selectedPlace.subCategories.length > 0 && (
                  <span>
                    {selectedPlace.subCategories
                      .map((sc) => CATEGORY_LABELS[sc] || sc)
                      .join(" | ")}
                  </span>
                )}
              {selectedPlace.place_type && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  - {selectedPlace.place_type}
                </span>
              )}
            </span>
          </div>

          {/* Right: Close X */}
          <button
            onClick={onClose}
            className="btn-close"
            title="إغلاق"
          >
            <IoMdClose />
          </button>
        </div>

        <div className="ios-sheet-content">
          {/* Images */}
          {selectedPlace.images && selectedPlace.images.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                margin: "20px 0",
                scrollbarWidth: "none",
              }}
            >
              {selectedPlace.images.map((img, i) => (
                <ImageWithSkeleton
                  key={i}
                  src={img}
                  alt={`${selectedPlace.name} ${i + 1}`}
                  style={{
                    width: "100%",
                    minWidth: "100%",
                    height: "230px",
                    objectFit: "cover",
                    borderRadius: "var(--ra-18)",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800";
                  }}
                />
              ))}
            </div>
          )}

          {/* Title Area */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                margin: "0 0 6px",
              }}
            >
              {selectedPlace.name}
            </h2>
            {selectedPlace.shortDescription && (
              <p
                style={{
                  fontSize: ".7rem",
                  color: "var(--text-secondary)",
                  fontWeight: "500",
                  margin: "0 0 10px",
                }}
              >
                {selectedPlace.shortDescription}
              </p>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              <span>
                <FaMapMarkerAlt /> {displayBranch.city} /{" "}
                {displayBranch.governorate}
              </span>
            </div>
          </div>

          {/* Action Row - 3 Buttons (Directions, Call, Favorite) */}
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
              href={
                displayBranch.googleMapsUrl ||
                `https://www.google.com/maps/dir/?api=1&destination=${displayBranch.latitude},${displayBranch.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#007aff",
                color: "#fff",
                borderRadius: "12px",
                padding: "8px 6px",
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
              <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                الاتجاهات
              </span>
            </a>

            {/* Call */}
            {displayBranch.phones && displayBranch.phones.length > 0 ? (
              <a
                href={`tel:${displayBranch.phones[0]}`}
                style={{
                  background: "rgba(124, 124, 124, 0.11)",
                  border: "1px solid var(--border-glass)",
                  color: "#007aff",
                  borderRadius: "12px",
                  padding: "8px 6px",
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
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  الهاتف
                </span>
              </a>
            ) : (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-muted)",
                  borderRadius: "12px",
                  padding: "8px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  opacity: 0.5,
                  textAlign: "center",
                }}
              >
                <i className="bx bx-phone-off" style={{ fontSize: "1.2rem" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  لا يتوفر
                </span>
              </div>
            )}

            {/* Favorite */}
            <button
              onClick={(e) => toggleFavorite(e, selectedPlace.id.toString())}
              style={{
                background: "rgba(124, 124, 124, 0.11)",
                border: "1px solid var(--border-glass)",
                color: isFav ? "#ff3b30" : "#007aff",
                borderRadius: "12px",
                padding: "8px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                cursor: "pointer",
                transition: "opacity 0.2s",
                fontFamily: "var(--font-display)",
              }}
            >
              <i
                className={isFav ? "bx bxs-heart" : "bx bx-heart"}
                style={{ fontSize: "1.2rem" }}
              />
              <span style={{ fontSize: "0.75rem", fontWeight: "500" }}>
                المفضلة
              </span>
            </button>
          </div>

          {/* Quick Info Box */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            {/* Hours */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span
                style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
              >
                حالة المكان
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {displayBranch.workingHours ? (
                  isCurrentlyOpen(displayBranch.workingHours) ? (
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        color: "#34c759",
                      }}
                    >
                      مفتوح
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        color: "#ff3b30",
                      }}
                    >
                      مغلق
                    </span>
                  )
                ) : (
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    غير محدد
                  </span>
                )}
              </div>
            </div>

            {/* Ratings */}
            {selectedPlace.rating !== undefined && (
              <div
                onClick={() => {
                  const el = document.getElementById("reviews-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  التقييمات والآراء
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {" "}
                    ({selectedPlace.reviewsCount || 0}){" "}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                      color: "#ff9f0a",
                    }}
                  >
                    {Number(selectedPlace.rating).toFixed(1)} ★
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Branch Selector Chips */}
          {selectedPlace.branches && selectedPlace.branches.length > 1 && (
            <div
              style={{
                marginBottom: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border-glass)",
              }}
            >
              <h4
                style={{
                  fontSize: "1rem",
                  marginBottom: "12px",
                  color: "var(--text-secondary)",
                  fontWeight: "bold",
                }}
              >
                الفروع
              </h4>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "10px",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
                className="hide-scrollbar"
              >
                {selectedPlace.branches.map((b) => {
                  const isSelected = b.id === displayBranch.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBranchId(b.id)}
                      style={{
                        background: isSelected
                          ? "var(--color-secondary)"
                          : "rgba(120,120,120,0.1)",
                        color: isSelected ? "#fff" : "var(--text-primary)",
                        border: isSelected
                          ? "none"
                          : "1px solid var(--border-glass)",
                        borderRadius: "20px",
                        padding: "8px 16px",
                        fontSize: "0.8rem",
                        fontWeight: isSelected ? "bold" : "normal",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        gap: "6px",
                        fontFamily: "var(--font-cairo)",
                      }}
                    >
                      {b.name} {b.city ? `- ${b.city}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media Images */}
          {mediaList.length > 0 && (
            <div style={{ margin: "20px 0" }}>
              <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                {mediaList.map((img, i) => (
                  <ImageWithSkeleton
                    key={i}
                    src={img}
                    alt="ميديا"
                    onClick={() => onMediaClick(i)}
                    style={{
                      width: "150px",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "18px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {selectedPlace.description && (
            <div
              style={{
                background: "rgba(120, 120, 120, 0.03)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                padding: "16px 20px",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                نبذة عن المكان
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.8",
                  margin: 0,
                }}
              >
                {selectedPlace.description}
              </p>
            </div>
          )}

          {/* Good to Know Card */}
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: "700",
                marginBottom: "12px",
                color: "var(--text-primary)",
              }}
            >
              معلومات مفيدة
            </h2>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {activeFeatures && activeFeatures.length > 0 ? (
                activeFeatures.map((fKey: string) => {
                  const feat = FEATURES_LIST.find((f) => f.key === fKey);
                  if (!feat) return null;
                  return (
                    <div
                      key={fKey}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "0.92rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{feat.icon}</span>
                      <span>{feat.label}</span>
                    </div>
                  );
                })
              ) : selectedPlace.category === "restaurant" ||
                selectedPlace.category === "cafe" ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🥗</span>
                    <span>خيارات نباتية متوفرة</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>👥</span>
                    <span>مناسب للمجموعات والعائلات</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>💳</span>
                    <span>يقبل الدفع بالبطاقات الائتمانية</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>📶</span>
                    <span>شبكة واي فاي مجانية</span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>✔️</span>
                    <span>مرافق مريحة للزوار</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>♿</span>
                    <span>مداخل سهلة للكراسي المتحركة</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>👨‍👩‍👧‍👦</span>
                    <span>مناسب لجميع الأعمار</span>
                  </div>
                </>
              )}

              {/* Sub-categories Badges inside Good to Know */}
              {selectedPlace.subCategories &&
                selectedPlace.subCategories.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid rgba(120, 120, 120, 0.1)",
                      paddingTop: "12px",
                      marginTop: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      التصنيفات الفرعية:
                    </span>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {selectedPlace.subCategories.map((subCatKey) => (
                        <span
                          key={subCatKey}
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-glass)",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "0.82rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i
                            className={`bx ${
                              CATEGORY_ICONS[subCatKey] || "bx-tag"
                            }`}
                            style={{ fontSize: "0.95rem" }}
                          />
                          {CATEGORY_LABELS[subCatKey] || subCatKey}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Services section inside Good to Know */}
              {branchServices && branchServices.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid rgba(120, 120, 120, 0.1)",
                    paddingTop: "12px",
                    marginTop: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    الخدمات المتاحة:
                  </span>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {branchServices.map((serviceName: string) => (
                      <span
                        key={serviceName}
                        style={{
                          background: "rgba(0, 111, 238, 0.08)",
                          color: "var(--color-primary)",
                          border: "1px solid rgba(0, 111, 238, 0.2)",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i
                          className="bx bx-check-double"
                          style={{ fontSize: "0.95rem" }}
                        />
                        {serviceName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Card (Phone, Website, Address) */}
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
              التفاصيل
            </h3>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Phone Row */}
              {displayBranch.phones && displayBranch.phones.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(120, 120, 120, 0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    الهاتف
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      alignItems: "flex-end",
                    }}
                  >
                    {displayBranch.phones.map((p: string, i: number) => (
                      <a
                        key={i}
                        href={`tel:${p}`}
                        style={{
                          fontSize: "0.92rem",
                          color: "#007aff",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Website Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid rgba(120, 120, 120, 0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  الموقع الإلكتروني
                </span>
                {(displayBranch as any).website_url ||
                (selectedPlace as any).website_url ? (
                  <a
                    href={
                      (displayBranch as any).website_url ||
                      (selectedPlace as any).website_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.92rem",
                      color: "#007aff",
                      textDecoration: "none",
                      fontWeight: "bold",
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      direction: "ltr",
                    }}
                  >
                    {(displayBranch as any).website_url ||
                      (selectedPlace as any).website_url}
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--text-muted)",
                      fontWeight: "bold",
                    }}
                  >
                    لا يوجد موقع
                  </span>
                )}
              </div>

              {/* Address Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  العنوان
                </span>
                <div
                  style={{
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    fontWeight: "600",
                    maxWidth: "220px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    alignItems: "flex-end",
                  }}
                >
                  <span>{displayBranch.fullAddress}</span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {displayBranch.city}، {displayBranch.governorate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          {displayBranch.workingHours && (
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
                  padding: "16px 20px",
                }}
              >
                {(() => {
                  const parsed = parseWorkingHours(displayBranch.workingHours);
                  if (!parsed) {
                    return (
                      <div style={{ color: "var(--text-secondary)" }}>
                        {displayBranch.workingHours}
                      </div>
                    );
                  }

                  if (parsed.type === "24/7") {
                    return (
                      <div
                        style={{
                          color: "var(--colorSuccess)",
                          fontWeight: "bold",
                          padding: "0px",
                          textAlign: "center",
                        }}
                      >
                        مفتوح طول أيام الأسبوع 24 ساعة
                      </div>
                    );
                  }

                  if (parsed.type === "custom" && parsed.schedule) {
                    const todayName = DAYS_OF_WEEK[new Date().getDay()];
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {parsed.schedule.map((day) => {
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
                                  color: day.isWorking
                                    ? "var(--text-primary)"
                                    : "#ff3b30",
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
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Bottom Dock / Report & Claim Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "24px",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={onOpenReportModal}
              style={{
                width: "100%",
                background: "rgba(255, 59, 48, 0.1)",
                border: "1px solid rgba(255, 59, 48, 0.2)",
                borderRadius: "12px",
                padding: "14px",
                color: "#ff3b30",
                fontWeight: "bold",
                fontSize: "0.9rem",
                fontFamily: "var(--font-cairo)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <i
                className="bx bx-error-circle"
                style={{ fontSize: "1.2rem" }}
              />
              <span>الإبلاغ عن مشكلة في البيانات</span>
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={onOpenNoteModal}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-cairo)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i
                  className="bx bx-notepad"
                  style={{ fontSize: "1.1rem", color: "#34c759" }}
                />
                <span>أضف تذكير</span>
                {!hasAccess && (
                  <i
                    className="bx bxs-crown"
                    style={{ fontSize: "0.95rem", color: "#fbbf24" }}
                  />
                )}
              </button>

              <button
                onClick={() => onShare(selectedPlace)}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-cairo)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <MdOutlineIosShare size={18} />
                <span>مشاركة </span>
              </button>
            </div>

            {/* Unique ID */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                opacity: 0.7,
                marginTop: "12px",
              }}
            >
              <span>كود المكان: #{selectedBranchId || selectedPlace.id}</span>
            </div>
          </div>

          {/* Reviews Section inside modal */}
          <ReviewSection
            place={selectedPlace}
            selectedBranchId={selectedBranchId}
            onRatingUpdate={onRatingUpdate}
          />
        </div>
      </div>
    </div>
  );
}

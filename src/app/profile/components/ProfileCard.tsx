"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { UserProfile, ProfileFormData } from "../types";
import { PROFILE_AVATARS, AVAILABLE_INTERESTS } from "../constants";
import styles from "../page.module.css";

interface ProfileCardProps {
  user: any;
  profile: UserProfile | null;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isOwnProfile: boolean;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  saving: boolean;
  uploadingAvatar: boolean;
  handleAvatarFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSaveProfile: () => Promise<void>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  profile,
  formData,
  setFormData,
  isOwnProfile,
  editMode,
  setEditMode,
  saving,
  uploadingAvatar,
  handleAvatarFileUpload,
  handleSaveProfile,
}) => {
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={`glass-panel ${styles.profileCard} ${
        isProfileExpanded ? styles.profileCardExpanded : ""
      }`}
      onClick={() => setIsProfileExpanded(!isProfileExpanded)}
    >
      {!user ? (
        /* ── Guest: Login Prompt ── */
        <div className={styles.guestContainer}>
          <div className={styles.guestAvatarBg}>
            <i className={`bx bx-user ${styles.guestAvatarIcon}`}></i>
          </div>
          <div className={styles.guestTextWrapper}>
            <h2 className={styles.guestTitle}>أهلاً بك!</h2>
            <p className={styles.guestSubtitle}>
              سجل دخولك للوصول إلى ملفك الشخصي وكل مزايا التطبيق
            </p>
          </div>
          <Link
            href="/login"
            className={`btn btn-primary ${styles.guestLoginBtn}`}
            style={{
              padding: "var(--padding-btn)",
              borderRadius: "8px",
            }}
          >
            <i className={`bx bx-log-in ${styles.guestLoginIcon}`}></i> تسجيل الدخول
          </Link>
          <Link href="/signup" className={styles.guestSignupLink}>
            ليس لديك حساب؟ إنشاء حساب جديد
          </Link>
        </div>
      ) : (
        <div className={styles.profileHeader}>
          <div className={styles.profileHeaderLeft}>
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Profile" className={styles.profileAvatar} />
            ) : (
              <div className={styles.profileAvatarPlaceholder}>
                <i className={`bx bxs-user ${styles.profileAvatarIcon}`}></i>
              </div>
            )}
            <div className={styles.profileInfoText}>
              <h3 className={styles.profileName}>{profile?.full_name}</h3>
              <p className={styles.profileEmail}>{profile?.email}</p>
            </div>
          </div>
          <i
            className={`bx ${
              isProfileExpanded ? "bx-chevron-up" : "bx-chevron-down"
            } ${styles.profileChevron}`}
          ></i>
        </div>
      )}

      {/* Expanded Profile Info / Form */}
      {user && isProfileExpanded && (
        <div onClick={(e) => e.stopPropagation()} className={styles.profileExpandedContent}>
          {editMode ? (
            <div className={styles.formGap}>
              {/* Profile Picture / Avatar Selection */}
              <div>
                <label className="help-label">الصورة الشخصية / الأفتار</label>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarRelative}>
                    {formData.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.avatarUrl} alt="Avatar" className={styles.formAvatarImg} />
                    ) : (
                      <div className={styles.formAvatarPlaceholder}>
                        <i className={`bx bxs-user ${styles.formAvatarIcon}`}></i>
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className={styles.avatarOverlay}>
                        <div className={`spinner ${styles.avatarSpinner}`} />
                      </div>
                    )}
                  </div>

                  <label className={`btn ${styles.uploadBtnLabel}`}>
                    <i className={`bx bx-upload ${styles.uploadIcon}`}></i>
                    {uploadingAvatar ? "جاري الرفع..." : "رفع صورة جديدة من جهازك"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className={styles.hiddenInput}
                      disabled={uploadingAvatar}
                    />
                  </label>

                  <span className={styles.uploadMutedText}>أو اختر أفتار جاهز:</span>
                  <div className={styles.avatarsGrid}>
                    {PROFILE_AVATARS.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                        className={`${styles.avatarPresetItem} ${
                          formData.avatarUrl === url
                            ? styles.avatarPresetItemActive
                            : formData.avatarUrl
                            ? styles.avatarPresetItemDimmed
                            : ""
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Avatar ${i}`} className={styles.avatarPresetImg} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="help-label">الاسم بالكامل</label>
                <input
                  type="text"
                  className="input-fields"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="help-label">تاريخ الميلاد</label>
                <input
                  type="date"
                  disabled
                  readOnly
                  className={`input-fields ${styles.inputDobDisabled}`}
                  value={formData.dob}
                  style={{ maxWidth: "99%", width: "100%" }}
                />
                <p className={styles.dobWarningText}>
                  لا يمكنك تغير تاريخ ميلادك اذا كنت قد ادخلت تاريخ ميلادك خطا فيرجى{" "}
                  <Link href="/help" className={styles.dobWarningLink}>
                    التواصل مع الإدارة للتغير
                  </Link>
                </p>
              </div>
              <div>
                <label className="help-label">اسم المستخدم (مرة كل 30 يوم)</label>
                <input
                  type="text"
                  className={`input-fields ${styles.usernameInput} ${
                    formData.username.length > 0 && formData.username.length < 3
                      ? styles.usernameInputInvalid
                      : ""
                  }`}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                />
                {formData.username.length > 0 &&
                  (formData.username.length < 3 ? (
                    <p className={styles.usernameWarningText}>
                      ⚠️ اسم المستخدم يجب أن يكون 3 حروف على الأقل.
                    </p>
                  ) : /^\d+$/.test(formData.username) || !/[a-z]/i.test(formData.username) ? (
                    <p className={styles.usernameWarningText}>
                      ⚠️ اسم المستخدم لا يمكن أن يتكون من أرقام فقط (يجب أن يحتوي على حروف إنجليزية).
                    </p>
                  ) : null)}
              </div>
              <div>
                <label className="help-label">البريد الإلكتروني (يتطلب تأكيد)</label>
                <input
                  type="email"
                  className={`input-fields ${styles.emailInput}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="help-label">رقم الهاتف (بدون صفر)</label>
                <div className={styles.phoneInputContainer}>
                  <div className={styles.phonePrefix}>
                    <Image
                      src="/images/profile/flag-egypt.png"
                      alt="phone"
                      width={20}
                      height={20}
                    />
                    <span className={styles.phonePrefixCode}>+20</span>
                    <span className={styles.phonePrefixDivider} />
                  </div>
                  <input
                    type="tel"
                    className={`input-fields ${styles.phoneInput}`}
                    value={formData.phone}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
                      if (numbersOnly.length <= 10) setFormData({ ...formData, phone: numbersOnly });
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="help-label">المحافظة</label>
                <select
                  className="input-fields help-select"
                  value={formData.governorate}
                  onChange={(e) =>
                    setFormData({ ...formData, governorate: e.target.value, city: "" })
                  }
                >
                  {governoratesList.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
              {formData.governorate && (
                <div>
                  <label className="help-label">المدينة</label>
                  <select
                    className="input-fields help-select"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="" disabled>
                      اختر المدينة...
                    </option>
                    {egyptLocations[formData.governorate]?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Interests Selection */}
              <div className={styles.interestsSection}>
                <label className="help-label">اهتماماتي (يمكنك اختيار أكثر من خيار)</label>
                <div className={styles.interestsGrid}>
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const isSelected = formData.interests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        className={`category-pill ${isSelected ? "active" : ""} ${
                          styles.interestPillBtn
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              interests: formData.interests.filter((id) => id !== interest.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              interests: [...formData.interests, interest.id],
                            });
                          }
                        }}
                      >
                        <i className={`${interest.icon} ${styles.interestPillIcon}`} />{" "}
                        {interest.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formButtonsRow}>
                <button
                  className={`btn ${styles.flex1}`}
                  onClick={() => setEditMode(false)}
                  style={{
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radiusBtnLg)",
                    width: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-heading)",
                    padding: "var(--padding-btn)",
                  }}
                >
                  إلغاء
                </button>
                <button
                  className={`btn btn-primary ${styles.flex1}`}
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radiusBtnLg)",
                    width: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-heading)",
                    padding: "var(--padding-btn)",
                  }}
                >
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.formGap}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>اسم المستخدم</span>
                <div className={styles.usernameWrapper}>
                  <span className={styles.infoValue}>{profile?.username}@</span>
                  <button
                    className={styles.copyButton}
                    onClick={() => {
                      if (profile?.username) {
                        navigator.clipboard.writeText(profile.username);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    title="نسخ اسم المستخدم"
                  >
                    <i
                      className={`bx ${copied ? "bx-check" : "bx-copy"} ${
                        copied ? styles.copiedIcon : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>رقم الهاتف</span>
                <span
                  className={styles.infoValue}
                  dir="ltr"
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Image
                    src="/images/profile/flag-egypt.png"
                    alt="phone"
                    width={20}
                    height={20}
                  />
                  {profile?.phone}
                </span>
              </div>
              {profile?.dob && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>تاريخ الميلاد</span>
                  <span className={styles.infoValue}>{profile.dob}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الجنس</span>
                <span className={styles.infoValue}>{profile?.gender}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>المنطقة</span>
                <span className={styles.infoValue}>
                  {profile?.city}، {profile?.governorate}
                </span>
              </div>

              {/* Interests Display */}
              <div className={styles.interestsDisplaySection}>
                <div className={styles.interestsDisplayTitle}>اهتماماتي</div>
                {profile?.interests && profile.interests.length > 0 ? (
                  <div className={styles.interestsGrid}>
                    {profile.interests.map((intId: string) => {
                      const interest = AVAILABLE_INTERESTS.find((i) => i.id === intId);
                      if (!interest) return null;
                      return (
                        <div
                          key={intId}
                          className={`category-pill active sub-title ${styles.interestPillReadonly}`}
                        >
                          <i className={`${interest.icon} ${styles.interestPillIcon}`} />{" "}
                          {interest.label}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.noInterestsCard}>
                    <p className={styles.noInterestsText}>
                      قم بإضافة اهتماماتك الآن لنتمكن من إرسال أقوى العروض والإشعارات التي تناسبك
                      خصيصاً!
                    </p>
                    {isOwnProfile && (
                      <button
                        className={`btn btn-secondary ${styles.addInterestsBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditMode(true);
                        }}
                      >
                        أضف الآن
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <div className={styles.formButtonsRow}>
                  <button
                    className={`btn btn-primary ${styles.flex1}`}
                    onClick={() => setEditMode(true)}
                    style={{ fontSize: "14px", fontWeight: "normal" }}
                  >
                    تعديل البيانات
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

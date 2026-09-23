import React, { RefObject } from "react";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { CATEGORIES_STRUCTURE, FEATURES_LIST } from "@/data/places";
import { MultiSelectSearch } from "@/components/ui/MultiSelectSearch";
import { SERVICES_LIST } from "@/data/services";
import { PlaceProposalFormData, CategoryItem } from "../types";
import styles from "../propose-place.module.css";

interface ProposePlaceFormProps {
  formRef?: RefObject<HTMLFormElement | null>;
  formData: PlaceProposalFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlaceProposalFormData>>;
  categories: CategoryItem[];
  loading: boolean;
  limitReached: boolean;
  isEditMode: boolean;
  errorMsg: string;
  newImgInput: string;
  setNewImgInput: (val: string) => void;
  isUploadingImg: boolean;
  onCategoryChange: (catName: string) => void;
  onAddImage: (e?: React.FormEvent | React.MouseEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProposePlaceForm({
  formRef,
  formData,
  setFormData,
  categories,
  loading,
  limitReached,
  isEditMode,
  errorMsg,
  newImgInput,
  setNewImgInput,
  isUploadingImg,
  onCategoryChange,
  onAddImage,
  onFileUpload,
  onRemoveImage,
  onSubmit,
}: ProposePlaceFormProps) {
  // Find current subcategories
  const currentCategoryStructure = CATEGORIES_STRUCTURE.find(
    (c) => c.name === formData.category
  );
  const availableSubCategories = currentCategoryStructure?.subCategories || [];

  const isSubmitDisabled = loading || (limitReached && !isEditMode);

  return (
    <form ref={formRef} onSubmit={onSubmit} className={styles.formCard}>
      {/* Error Message Alert */}
      {errorMsg && (
        <div className={`${styles.alertBox} ${styles.alertDanger}`}>
          <i className="bx bx-error-circle" style={{ fontSize: "1.4rem", color: "#ff3b30" }} />
          <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "#ff3b30" }}>
            {errorMsg}
          </span>
        </div>
      )}

      {/* ==================== Section 1: Basic Info ==================== */}
      <div className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-info-circle" /> البيانات الأساسية للمكان
        </h2>

        <div className={styles.gridRow}>
          {/* Place Name */}
          <div className={styles.fullCol}>
            <label className={styles.fieldLabel}>
              اسم المكان <span style={{ color: "#ff3b30" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: مطعم وكافيه الفيروز"
              className="input-fields"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <p className={styles.fieldHint}>
              💡 <strong>تلميح:</strong> يفضل كتابة اسم المكان الرسمي المكتوب على اليافتة لسهولة التعرف عليه.
            </p>
          </div>

          {/* Main Category */}
          <div className={styles.fullCol}>
            <label className={styles.fieldLabel}>
              التصنيف الرئيسي <span style={{ color: "#ff3b30" }}>*</span>
            </label>
            <select
              required
              className="input-fields help-select"
              value={formData.category}
              onChange={(e) => onCategoryChange(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="" disabled>
                اختر التصنيف الرئيسي...
              </option>
              {CATEGORIES_STRUCTURE.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
            <p className={styles.fieldHint}>
              💡 اختر التصنيف الأقرب لنشاط المكان الرئيسي.
            </p>
          </div>

          {/* Sub Categories Pill Toggle */}
          {formData.category && availableSubCategories.length > 0 && (
            <div className={`${styles.fullCol} ${styles.pillsBox}`}>
              <label className={styles.fieldLabel} style={{ marginBottom: "10px", color: "var(--text-primary)" }}>
                التصنيفات الفرعية التابعة للقسم الرئيسي
              </label>
              <div className={styles.pillsWrap}>
                {availableSubCategories.map((cat) => {
                  const isSelected = formData.sub_categories?.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        const current = formData.sub_categories || [];
                        const next = isSelected
                          ? current.filter((s) => s !== cat.name)
                          : [...current, cat.name];
                        const shouldResetType = current[0] !== next[0];
                        setFormData({
                          ...formData,
                          sub_categories: next,
                          ...(shouldResetType ? { place_type: "", place_type_icon: "" } : {}),
                        });
                      }}
                      className={`${styles.pillBtn} ${isSelected ? styles.pillBtnActive : ""}`}
                    >
                      <i className={`bx ${cat.icon}`} /> {cat.label} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub Type Input */}
          {formData.category && formData.sub_categories?.length > 0 && (
            <div className={styles.fullCol}>
              <label className={styles.fieldLabel}>
                النوع الفرعي للمكان (مثل: المطبخ الصيني أو السوري للمطاعم، القهوة العربية للكافيهات):
              </label>
              <input
                className="input-fields"
                placeholder="مثال: سوري، صيني، إيطالي..."
                value={formData.place_type}
                onChange={(e) => setFormData({ ...formData, place_type: e.target.value })}
              />
            </div>
          )}

          {/* Features Selection */}
          <div className={`${styles.fullCol} ${styles.pillsBox}`}>
            <label className={styles.fieldLabel} style={{ marginBottom: "10px", color: "var(--text-primary)" }}>
              مميزات إضافية للمكان (اختر كل ما ينطبق)
            </label>
            <div className={styles.pillsWrap}>
              {FEATURES_LIST.map((feat) => {
                const isSelected = formData.features?.includes(feat.key);
                return (
                  <button
                    key={feat.key}
                    type="button"
                    onClick={() => {
                      const current = formData.features || [];
                      const next = isSelected
                        ? current.filter((s) => s !== feat.key)
                        : [...current, feat.key];
                      setFormData({ ...formData, features: next });
                    }}
                    className={`${styles.pillBtn} ${isSelected ? styles.pillBtnActive : ""}`}
                  >
                    <span>{feat.label}</span> {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services Selection */}
          <div className={styles.fullCol}>
            <MultiSelectSearch
              label="الخدمات المتاحة بالمكان"
              options={SERVICES_LIST}
              selected={formData.services || []}
              onChange={(selected) => setFormData({ ...formData, services: selected })}
              placeholder="ابحث عن خدمات مثل: قاعة أفراح، شركة شحن، كهربائي سيارات..."
            />
          </div>
        </div>
      </div>

      {/* ==================== Section 2: Location & Address ==================== */}
      <div className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-map" /> الموقع والعنوان التفصيلي
        </h2>

        <div className={styles.gridRow}>
          {/* Governorate */}
          <div>
            <label className={styles.fieldLabel}>
              المحافظة <span style={{ color: "#ff3b30" }}>*</span>
            </label>
            <select
              required
              className="input-fields help-select"
              value={formData.governorate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  governorate: e.target.value,
                  city: "",
                })
              }
            >
              <option value="" disabled>
                اختر المحافظة...
              </option>
              {governoratesList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className={styles.fieldLabel}>
              المدينة / المنطقة <span style={{ color: "#ff3b30" }}>*</span>
            </label>
            <select
              required
              disabled={!formData.governorate}
              className="input-fields help-select"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            >
              <option value="" disabled>
                اختر المدينة...
              </option>
              {formData.governorate &&
                egyptLocations[formData.governorate]?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Detailed Address */}
          <div className={styles.fullCol}>
            <label className={styles.fieldLabel}>العنوان التفصيلي</label>
            <input
              type="text"
              placeholder="مثال: شارع الجلاء، أمام مستشفى السلام، بجوار البنك الأهلي"
              className="input-fields"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <p className={styles.fieldHint}>
              💡 اكتب علامة مميزة بجوار المكان لسهولة الوصول إليه.
            </p>
          </div>

          {/* Google Maps URL */}
          <div className={styles.fullCol}>
            <label className={styles.fieldLabel}>رابط خريطة جوجل</label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              className="input-fields"
              value={formData.location_url}
              onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
              style={{ direction: "ltr", textAlign: "left" }}
            />
            <p className={styles.fieldHint}>
              💡 افتح خريطة جوجل واعمل &quot;مشاركة&quot; للرابط ولصقه هنا ليتسنى للزوار التوجه بالخريطة مباشرة!
            </p>
          </div>
        </div>
      </div>

      {/* ==================== Section 3: Contact & Hours ==================== */}
      <div className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-phone-call" /> التواصل وساعات العمل
        </h2>

        <div className={styles.gridRow}>
          <div>
            <label className={styles.fieldLabel}>رقم الهاتف</label>
            <input
              type="tel"
              placeholder="01012345678"
              className="input-fields"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ direction: "ltr", textAlign: "left" }}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>مواعيد العمل</label>
            <input
              type="text"
              placeholder="مثال: يومياً من 10 صباحاً حتى 12 منتصف الليل"
              className="input-fields"
              value={formData.working_hours}
              onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
            />
          </div>

          <div className={styles.fullCol}>
            <label className={styles.fieldLabel}>رابط موقع المكان الإلكتروني (إن وجد)</label>
            <input
              type="url"
              placeholder="https://example.com"
              className="input-fields"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              style={{ direction: "ltr", textAlign: "left" }}
            />
          </div>
        </div>
      </div>

      {/* ==================== Section 4: Images & Media ==================== */}
      <div className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-image" /> صور المكان
        </h2>

        <div className={styles.uploadZone}>
          {/* Upload Button */}
          <label
            className={`${styles.uploadFileBtn} ${isUploadingImg ? styles.uploadFileBtnDisabled : ""}`}
          >
            <i
              className={isUploadingImg ? "bx bx-loader-alt bx-spin" : "bx bx-cloud-upload"}
              style={{ fontSize: "1.3rem" }}
            />
            <span>{isUploadingImg ? "جاري رفع الصورة..." : "رفع صورة من جهازك"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              disabled={isUploadingImg}
              style={{ display: "none" }}
            />
          </label>

          {/* Paste URL */}
          <div className={styles.urlInputRow}>
            <input
              type="url"
              placeholder="أو ضع رابط صورة من الإنترنت (https://...)"
              className="input-fields"
              value={newImgInput}
              onChange={(e) => setNewImgInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddImage();
                }
              }}
              style={{ flex: 1, direction: "ltr", textAlign: "left" }}
            />
            <button
              type="button"
              onClick={onAddImage}
              disabled={!newImgInput.trim()}
              className={styles.addUrlBtn}
            >
              <i className="bx bx-link" /> إضافة رابط
            </button>
          </div>
        </div>

        {/* Thumbnail Preview Grid */}
        {formData.images.length > 0 && (
          <div className={styles.imagesGrid}>
            {formData.images.map((img, idx) => (
              <div key={idx} className={styles.imageThumbCard}>
                <img src={img} alt={`Preview ${idx}`} className={styles.thumbImg} />
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className={styles.deleteThumbBtn}
                  aria-label="حذف الصورة"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <p className={styles.fieldHint} style={{ marginTop: "10px" }}>
          💡 <strong>نصيحة:</strong> الصور الواضحة تزيد بنسبة كبيرة من سرعة موافقة الإدارة على المكان المقترح!
        </p>
      </div>

      {/* ==================== Section 5: Description ==================== */}
      <div>
        <label className={styles.fieldLabel}>وصف عن المكان والخدمات المقدمة</label>
        <textarea
          rows={4}
          placeholder="اكتب نبذة عن المكان والخدمات أو المميزات التي يشتهر بها..."
          className="input-fields"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* ==================== Submit Button ==================== */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={`btn btn-primary ${styles.submitBtn}`}
        style={{
          opacity: isSubmitDisabled ? 0.6 : 1,
          cursor: isSubmitDisabled ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: "20px", height: "20px" }} />
            جاري الإرسال...
          </>
        ) : (
          <>
            <i className="bx bx-paper-plane" style={{ fontSize: "1.3rem" }} />
            {isEditMode
              ? "إعادة إرسال للمراجعة"
              : limitReached
              ? "الحد الأقصى معلق (اختر مكان لتعديله)"
              : "إرسال الاقتراح للإدارة"}
          </>
        )}
      </button>
    </form>
  );
}

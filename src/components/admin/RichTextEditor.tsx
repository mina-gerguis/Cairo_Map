"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "اكتب محتوى المقال هنا...",
  minHeight = "400px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || "");
  const [activeFormats, setActiveFormats] = useState<{ [key: string]: boolean }>({});
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  // Keep editor content in sync with external value on initial load or reset
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML && !showSource) {
      editorRef.current.innerHTML = value || "";
    }
    setSourceCode(value || "");
  }, [value, showSource]);

  const executeCommand = (command: string, valueArgument: string | undefined = undefined) => {
    document.execCommand(command, false, valueArgument);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
    }
    updateActiveFormats();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
    }
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    if (typeof window === "undefined") return;
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyFull: document.queryCommandState("justifyFull"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const applyFontSize = (size: string) => {
    // 1-7 size scale for execCommand fontSize
    executeCommand("fontSize", size);
  };

  const applyFormatBlock = (tag: string) => {
    executeCommand("formatBlock", tag);
  };

  const applyTextColor = (color: string) => {
    executeCommand("foreColor", color);
  };

  const applyHighlightColor = (color: string) => {
    executeCommand("hiliteColor", color);
  };

  const insertImage = () => {
    if (!imageUrlInput.trim()) return;
    executeCommand("insertImage", imageUrlInput.trim());
    setImageUrlInput("");
    setShowImageModal(false);
  };

  const insertLink = () => {
    if (!linkUrlInput.trim()) return;
    executeCommand("createLink", linkUrlInput.trim());
    setLinkUrlInput("");
    setShowLinkModal(false);
  };

  const toggleSourceView = () => {
    if (showSource) {
      // Switching from source to HTML preview editor
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
      onChange(sourceCode);
    } else {
      // Switching to source code mode
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
    }
    setShowSource(!showSource);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSourceCode(val);
    onChange(val);
  };

  const colorPresets = [
    "#000000", "#1e293b", "#ef4444", "#f97316", "#f59e0b",
    "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
    "#ec4899", "#ffffff"
  ];

  return (
    <div className={styles.editorContainer}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        {/* Undo / Redo */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand("undo")}
            title="تراجع (Ctrl+Z)"
          >
            <i className="bx bx-undo" />
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand("redo")}
            title="إعادة (Ctrl+Y)"
          >
            <i className="bx bx-redo" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Headings & Text Size */}
        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolbarSelect}
            onChange={(e) => {
              if (e.target.value.startsWith("H")) {
                applyFormatBlock(e.target.value);
              } else if (e.target.value.startsWith("FS")) {
                applyFontSize(e.target.value.replace("FS", ""));
              } else {
                applyFormatBlock("P");
              }
              e.target.value = "";
            }}
            defaultValue=""
          >
            <option value="" disabled>حجم النص / العنوان</option>
            <option value="P">عادي (فقرة)</option>
            <option value="H1">عنوان رئيسي كبير (H1)</option>
            <option value="H2">عنوان فرعي مهم (H2)</option>
            <option value="H3">عنوان متوسط (H3)</option>
            <option value="H4">عنوان صغير (H4)</option>
            <option value="FS5">خط كبير جداً</option>
            <option value="FS4">خط كبير</option>
            <option value="FS3">خط متوسط</option>
            <option value="FS2">خط صغير</option>
          </select>
        </div>

        <div className={styles.divider} />

        {/* Text Style Formatting */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.bold ? styles.active : ""}`}
            onClick={() => executeCommand("bold")}
            title="عريض (Bold)"
          >
            <i className="bx bx-bold" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.italic ? styles.active : ""}`}
            onClick={() => executeCommand("italic")}
            title="مائل (Italic)"
          >
            <i className="bx bx-italic" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.underline ? styles.active : ""}`}
            onClick={() => executeCommand("underline")}
            title="تحته خط (Underline)"
          >
            <i className="bx bx-underline" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.strikeThrough ? styles.active : ""}`}
            onClick={() => executeCommand("strikeThrough")}
            title="يتوسطه خط (Strikethrough)"
          >
            <i className="bx bx-strikethrough" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Colors (Text & Background Highlight) */}
        <div className={styles.toolbarGroup}>
          <div className={styles.colorPickerWrapper} title="لون النص">
            <i className="bx bx-font-color" style={{ color: selectedColor }} />
            <input
              type="color"
              className={styles.colorInput}
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                applyTextColor(e.target.value);
              }}
            />
          </div>

          {/* Quick Color Presets Dropdown */}
          <div className={styles.colorPresets}>
            {colorPresets.slice(2, 9).map((c) => (
              <button
                key={c}
                type="button"
                className={styles.colorDot}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setSelectedColor(c);
                  applyTextColor(c);
                }}
                title={`لون ${c}`}
              />
            ))}
          </div>

          <div className={styles.colorPickerWrapper} title="تظليل خلفية النص">
            <i className="bx bx-highlight" />
            <input
              type="color"
              className={styles.colorInput}
              defaultValue="#fef08a"
              onChange={(e) => applyHighlightColor(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* Alignment */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.justifyRight ? styles.active : ""}`}
            onClick={() => executeCommand("justifyRight")}
            title="محاذاة لليمن"
          >
            <i className="bx bx-align-right" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.justifyCenter ? styles.active : ""}`}
            onClick={() => executeCommand("justifyCenter")}
            title="محاذاة للوسط"
          >
            <i className="bx bx-align-middle" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.justifyLeft ? styles.active : ""}`}
            onClick={() => executeCommand("justifyLeft")}
            title="محاذاة لليسار"
          >
            <i className="bx bx-align-left" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.justifyFull ? styles.active : ""}`}
            onClick={() => executeCommand("justifyFull")}
            title="ضبط المحاذاة (Justify)"
          >
            <i className="bx bx-align-justify" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Lists & Quotes */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.insertUnorderedList ? styles.active : ""}`}
            onClick={() => executeCommand("insertUnorderedList")}
            title="قائمة نقطية"
          >
            <i className="bx bx-list-ul" />
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.insertOrderedList ? styles.active : ""}`}
            onClick={() => executeCommand("insertOrderedList")}
            title="قائمة رقمية"
          >
            <i className="bx bx-list-ol" />
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => applyFormatBlock("BLOCKQUOTE")}
            title="إدراج اقتباس"
          >
            <i className="bx bx-select-multiple" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Media: Image & Link */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => setShowImageModal(true)}
            title="إدراج صورة داخل المقال"
          >
            <i className="bx bx-image-add" style={{ color: "#10b981", fontSize: "1.2rem" }} />
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => setShowLinkModal(true)}
            title="إدراج رابط"
          >
            <i className="bx bx-link" />
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand("removeFormat")}
            title="إزالة التنسيق"
          >
            <i className="bx bx-eraser" />
          </button>
        </div>

        <div className={styles.divider} style={{ marginRight: "auto" }} />

        {/* Code / Source Toggle */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${showSource ? styles.active : ""}`}
            onClick={toggleSourceView}
            title={showSource ? "العودة للمحرر المرئي" : "عرض كود HTML"}
          >
            <i className="bx bx-code-alt" />
            <span className={styles.btnLabel}>{showSource ? "المحرر" : "HTML"}</span>
          </button>
        </div>
      </div>

      {/* ── Editor Body Area ── */}
      {showSource ? (
        <textarea
          className={styles.sourceTextarea}
          value={sourceCode}
          onChange={handleSourceChange}
          style={{ minHeight }}
          placeholder="أدخل كود HTML المقال هنا..."
        />
      ) : (
        <div
          ref={editorRef}
          className={styles.editableContent}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          style={{ minHeight }}
          data-placeholder={placeholder}
          dir="rtl"
        />
      )}

      {/* ── Modal: Insert Image ── */}
      {showImageModal && (
        <div className={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div className={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              <i className="bx bx-image-add" /> إدراج صورة للمقال
            </h3>
            <p className={styles.modalSubtitle}>ضع رابط الصورة مباشرة (URL) لإدراجها في نص المقال</p>
            <input
              type="text"
              className={styles.modalInput}
              placeholder="https://example.com/image.jpg"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowImageModal(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className={styles.modalSubmitBtn}
                onClick={insertImage}
              >
                إدراج الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Insert Link ── */}
      {showLinkModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLinkModal(false)}>
          <div className={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              <i className="bx bx-link" /> إدراج رابط
            </h3>
            <p className={styles.modalSubtitle}>أدخل رابط الموقع المراد الإشارة إليه</p>
            <input
              type="text"
              className={styles.modalInput}
              placeholder="https://example.com"
              value={linkUrlInput}
              onChange={(e) => setLinkUrlInput(e.target.value)}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowLinkModal(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className={styles.modalSubmitBtn}
                onClick={insertLink}
              >
                إضافة الرابط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

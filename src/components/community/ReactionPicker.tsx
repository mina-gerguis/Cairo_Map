"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactionType,
  COMMUNITY_REACTIONS,
} from "@/types/community";
import styles from "@/app/had-yaaraf/had-yaaraf.module.css";

interface ReactionPickerProps {
  userReaction?: ReactionType | null;
  reactionsCount: Record<ReactionType, number>;
  onSelectReaction: (type: ReactionType) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const REACTION_KEYS: ReactionType[] = ["like", "dislike", "laugh", "love", "sad", "angry"];

export default function ReactionPicker({
  userReaction,
  reactionsCount,
  onSelectReaction,
  disabled = false,
  size = "md",
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 280);
  };

  const currentMeta = userReaction ? COMMUNITY_REACTIONS[userReaction] : null;
  const totalCount = REACTION_KEYS.reduce((sum, key) => sum + (reactionsCount[key] || 0), 0);

  const topActiveEmojis = REACTION_KEYS.filter((k) => (reactionsCount[k] || 0) > 0)
    .sort((a, b) => (reactionsCount[b] || 0) - (reactionsCount[a] || 0))
    .slice(0, 3);

  const handleMainButtonClick = () => {
    if (disabled) return;
    if (userReaction) {
      onSelectReaction(userReaction);
    } else {
      onSelectReaction("like");
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.reactionPickerContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating 6 Emojis Bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 5 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className={styles.floatingEmojisBar}
          >
            {REACTION_KEYS.map((key, idx) => {
              const meta = COMMUNITY_REACTIONS[key];
              const isSelected = userReaction === key;

              return (
                <motion.button
                  key={key}
                  type="button"
                  whileHover={{ scale: 1.45, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.025 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReaction(key);
                    setIsOpen(false);
                  }}
                  className={`${styles.emojiBtn} ${isSelected ? styles.emojiBtnSelected : ""}`}
                  title={meta.label}
                >
                  <span>{meta.emoji}</span>
                  <span className={styles.emojiTooltip}>{meta.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleMainButtonClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={`${styles.mainReactionBtn} ${currentMeta ? styles.mainReactionBtnActive : ""}`}
        style={size === "sm" ? { padding: "5px 12px", fontSize: "0.8rem" } : undefined}
      >
        {currentMeta ? (
          <>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{currentMeta.emoji}</span>
            <span>{currentMeta.label}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>👍</span>
            <span>تفاعل</span>
          </>
        )}
      </button>

      {/* Total Reactions Count & Top Emojis */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.reactionsCountSummary}
          title="تفاصيل التفاعلات"
        >
          <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {topActiveEmojis.map((key) => (
              <span key={key} style={{ fontSize: "0.95rem" }}>
                {COMMUNITY_REACTIONS[key].emoji}
              </span>
            ))}
          </div>
          <span>{totalCount}</span>
        </button>
      )}
    </div>
  );
}

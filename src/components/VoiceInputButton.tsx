"use client";

import React, { useState, useEffect } from "react";
import { FaMicrophone, FaSpinner } from "react-icons/fa";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export default function VoiceInputButton({ onTranscript, className = "" }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const handleListen = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("متصفحك لا يدعم البحث الصوتي المباشر. يُفضل استخدام متصفح Chrome أو Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-EG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleListen}
      title={isListening ? "جاري الاستماع... اتكلم دلوقتي" : "بحث صوتي"}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-white"
      } ${className}`}
      style={{
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid rgba(108, 99, 255, 0.3)",
        background: isListening ? "#ef4444" : "rgba(108, 99, 255, 0.15)",
        color: isListening ? "#ffffff" : "#a5b4fc",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      {isListening ? (
        <>
          <FaSpinner className="animate-spin" />
          <span style={{ fontSize: "12px" }}>بإسمعك...</span>
        </>
      ) : (
        <>
          <FaMicrophone />
          <span style={{ fontSize: "12px" }}>صوتي</span>
        </>
      )}
    </button>
  );
}

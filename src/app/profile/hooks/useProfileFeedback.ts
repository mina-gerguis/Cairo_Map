"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  UserProfile,
  PlaceProposal,
  PlaceReport,
  AppFeedback,
  FaqItem,
  ContactFormData,
  ProfileAlertMessage,
} from "../types";
import { INITIAL_CONTACT_FORM } from "../constants";

interface UseProfileFeedbackProps {
  user: any;
  profile: UserProfile | null;
  faqs: FaqItem[];
  setFaqs: React.Dispatch<React.SetStateAction<FaqItem[]>>;
  setMessage: (msg: ProfileAlertMessage | null) => void;
}

export const useProfileFeedback = ({
  user,
  profile,
  faqs,
  setFaqs,
  setMessage,
}: UseProfileFeedbackProps) => {
  // Requests & Reports
  const [userProposals, setUserProposals] = useState<PlaceProposal[]>([]);
  const [userReports, setUserReports] = useState<PlaceReport[]>([]);
  const [userAppFeedbacks, setUserAppFeedbacks] = useState<AppFeedback[]>([]);
  const [isRequestsExpanded, setIsRequestsExpanded] = useState(false);
  const [activeRequestsTab, setActiveRequestsTab] = useState<"proposals" | "reports" | "app_feedback">(
    "proposals"
  );
  const [loadingRequests, setLoadingRequests] = useState(false);

  const pendingCount =
    userProposals.filter((p) => p.status === "pending").length +
    userReports.filter((r) => r.status === "pending" || r.status === "reviewed").length +
    userAppFeedbacks.filter((f) => f.status === "pending" || f.status === "reviewed").length;
  const isLimitReached = pendingCount >= 5;

  // Retract and delete states
  const [proposalToRetract, setProposalToRetract] = useState<string | null>(null);
  const [reportToRetract, setReportToRetract] = useState<string | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<AppFeedback | null>(null);

  // Suggestions state
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionType, setSuggestionType] = useState("اقتراح لتحسين الشكل");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const isSuggestionFormValid = suggestionMessage.trim().length > 0;

  // Bug reports state
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [bugType, setBugType] = useState("");
  const [bugDetails, setBugDetails] = useState("");
  const [bugImage, setBugImage] = useState("");
  const [bugImageFile, setBugImageFile] = useState<File | null>(null);
  const [bugLoading, setBugLoading] = useState(false);
  const [bugUploading, setBugUploading] = useState(false);
  const isBugFormValid = bugType.trim().length > 0 && bugDetails.trim().length > 0;

  // Help Section States
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [helpTab, setHelpTab] = useState<"faq" | "social" | "contact">("faq");

  // FAQ States
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);

  // Contact Form States
  const [contactForm, setContactForm] = useState<ContactFormData>(INITIAL_CONTACT_FORM);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      const nameParts = (profile.full_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setContactForm((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || "",
        governorate: prev.governorate || profile.governorate || "",
        city: prev.city || profile.city || "",
      }));
    }
  }, [profile]);

  // URL hash / params watcher for help section
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkHelpParam = () => {
      const params = new URLSearchParams(window.location.search);
      const isHelp =
        params.get("expand") === "help" ||
        params.get("tab") === "help" ||
        params.get("tab") === "contact" ||
        params.get("section") === "help" ||
        window.location.hash === "#help" ||
        window.location.hash === "#help-section";

      if (isHelp) {
        setIsHelpExpanded(true);
        if (params.get("tab") === "contact") {
          setHelpTab("contact");
        } else if (params.get("tab") === "social") {
          setHelpTab("social");
        }

        setTimeout(() => {
          const el = document.getElementById("help-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 350);
      }
    };

    checkHelpParam();
    const timer = setTimeout(checkHelpParam, 300);
    window.addEventListener("hashchange", checkHelpParam);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", checkHelpParam);
    };
  }, []);

  const fetchUserRequestsAndReports = async (targetId?: string) => {
    if (!supabase || !user) return;
    setLoadingRequests(true);
    const queryUserId =
      targetId ||
      (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null) ||
      user.id;

    try {
      // 1. Fetch place proposals
      const { data: propData, error: propErr } = await supabase
        .from("place_proposals")
        .select("*")
        .eq("user_id", queryUserId)
        .order("created_at", { ascending: false });

      if (propErr) console.error("Error fetching user proposals:", propErr);
      else setUserProposals(propData || []);

      // 2. Fetch place reports
      const { data: repData, error: repErr } = await supabase
        .from("place_reports")
        .select("*")
        .eq("user_id", queryUserId)
        .order("created_at", { ascending: false });

      if (repErr) {
        console.error("Error fetching user reports:", repErr);
        setUserReports([]);
      } else if (repData && repData.length > 0) {
        const placeIds = Array.from(new Set(repData.map((r) => r.place_id).filter(Boolean)));
        let placesMap = new Map();
        if (placeIds.length > 0) {
          const { data: placesData, error: placesErr } = await supabase
            .from("places")
            .select("id, name")
            .in("id", placeIds);

          if (placesErr) console.error("Error resolving place names for reports:", placesErr);
          if (placesData) {
            placesMap = new Map(placesData.map((p) => [p.id, p.name]));
          }
        }

        const resolvedReports = repData.map((report) => ({
          ...report,
          place_name: placesMap.get(report.place_id) || "مكان محذوف أو غير معروف",
        }));
        setUserReports(resolvedReports);
      } else {
        setUserReports([]);
      }

      // 3. Fetch app suggestions and bug reports
      const { data: feedbackData, error: feedbackErr } = await supabase
        .from("app_feedback")
        .select("*")
        .eq("user_id", queryUserId)
        .order("created_at", { ascending: false });

      if (feedbackErr) {
        console.error("Error fetching user app feedback:", feedbackErr);
        setUserAppFeedbacks([]);
      } else {
        setUserAppFeedbacks(feedbackData || []);
      }
    } catch (e) {
      console.error("Error fetching user requests and reports:", e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRequestsAndReports();
    }
  }, [user]);

  const handleRetractProposal = async (proposalId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("place_proposals")
        .update({ status: "retracted", updated_at: new Date().toISOString() })
        .eq("id", proposalId)
        .eq("user_id", user.id);

      if (error) throw error;
      alert("تم التراجع عن اقتراح المكان بنجاح.");
      fetchUserRequestsAndReports();
    } catch (err: any) {
      alert("فشل التراجع عن الاقتراح: " + err.message);
    }
  };

  const handleRetractReport = async (reportId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("place_reports")
        .update({ status: "retracted" })
        .eq("id", reportId)
        .eq("user_id", user.id);

      if (error) throw error;
      alert("تم التراجع عن البلاغ بنجاح.");
      fetchUserRequestsAndReports();
    } catch (err: any) {
      alert("فشل التراجع عن البلاغ: " + err.message);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("app_feedback")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setMessage({ type: "success", text: "تم حذف الطلب بنجاح." });
      setFeedbackToDelete(null);
      fetchUserRequestsAndReports();
    } catch (err: any) {
      setMessage({ type: "error", text: "فشل حذف الطلب: " + err.message });
    }
  };

  const handleSendSuggestion = async () => {
    if (!supabase || !user) return;
    if (!suggestionMessage.trim()) {
      setMessage({ type: "error", text: "يرجى كتابة رسالة الاقتراح" });
      return;
    }
    setSuggestionLoading(true);
    try {
      const { error } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "suggestion",
          category: suggestionType,
          content: suggestionMessage.trim(),
          status: "pending",
        },
      ]);
      if (error) throw error;

      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          title: "تم استلام اقتراحك بنجاح 💡",
          message: `شكراً لمشاركتنا اقتراحك بخصوص: "${suggestionType}". تم تسجيله وجاري مراجعته من قبل الإدارة.`,
          type: "success",
          link: "/profile",
        },
      ]);

      setMessage({ type: "success", text: "تم إرسال اقتراحك بنجاح! شكراً لك." });
      setShowSuggestionModal(false);
      setSuggestionMessage("");
      fetchUserRequestsAndReports();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "حدث خطأ أثناء إرسال الاقتراح: " + (err.message || "") });
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleBugImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBugImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBugImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendBugReport = async () => {
    if (!supabase || !user || !bugType.trim() || !bugDetails.trim()) return;
    setBugLoading(true);
    let uploadedImageUrl = null;
    try {
      if (bugImageFile) {
        setBugUploading(true);
        const fileExt = bugImageFile.name.split(".").pop();
        const filePath = `feedback_bugs/${user.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("avatars")
          .upload(filePath, bugImageFile, { upsert: true });

        if (uploadError) {
          throw new Error("فشل رفع الصورة: " + uploadError.message);
        }
        if (data) {
          const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
          uploadedImageUrl = pub.publicUrl;
        }
        setBugUploading(false);
      }

      const { error } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          title: bugType.trim(),
          content: bugDetails.trim(),
          image_url: uploadedImageUrl || bugImage || null,
          status: "pending",
        },
      ]);
      if (error) throw error;

      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          title: "تم تسجيل بلاغ المشكلة ⚠️",
          message: `تم استلام بلاغك بخصوص المشكلة: "${bugType}". سنقوم بمراجعته وحلها في أقرب وقت.`,
          type: "success",
          link: "/profile",
        },
      ]);

      setMessage({ type: "success", text: "تم إرسال بلاغك بنجاح! سنقوم بمراجعته قريباً." });
      setShowBugReportModal(false);
      setBugType("");
      setBugDetails("");
      setBugImage("");
      setBugImageFile(null);
      fetchUserRequestsAndReports();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "حدث خطأ أثناء إرسال البلاغ: " + (err.message || "") });
    } finally {
      setBugLoading(false);
      setBugUploading(false);
    }
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !faqQuestion.trim() || !faqAnswer.trim()) return;
    setFaqLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert([{ question: faqQuestion.trim(), answer: faqAnswer.trim() }])
        .select();
      if (error) throw error;
      if (data) {
        setFaqs([...faqs, data[0]]);
        setFaqQuestion("");
        setFaqAnswer("");
      }
    } catch (err: any) {
      alert("فشل إضافة السؤال الشائع: " + err.message);
    } finally {
      setFaqLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال الشائع؟")) return;
    if (!supabase) return;
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      setFaqs(faqs.filter((f) => f.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("تعذر الاتصال بقاعدة البيانات.");
      return;
    }
    setContactLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          first_name: contactForm.firstName,
          last_name: contactForm.lastName,
          phone: contactForm.phone,
          email: contactForm.email,
          contact_type: contactForm.contactType,
          message: contactForm.message,
          user_id: user ? user.id : null,
        },
      ]);

      if (error) throw error;

      setContactSubmitted(true);
      setContactForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        governorate: "",
        city: "",
        contactType: "",
        message: "",
      });
    } catch (err: any) {
      console.error("Error submitting contact message:", err);
      alert("فشل إرسال الرسالة: " + err.message);
    } finally {
      setContactLoading(false);
    }
  };

  return {
    userProposals,
    userReports,
    userAppFeedbacks,
    pendingCount,
    isLimitReached,
    isRequestsExpanded,
    setIsRequestsExpanded,
    activeRequestsTab,
    setActiveRequestsTab,
    loadingRequests,
    proposalToRetract,
    setProposalToRetract,
    reportToRetract,
    setReportToRetract,
    feedbackToDelete,
    setFeedbackToDelete,
    showSuggestionModal,
    setShowSuggestionModal,
    suggestionType,
    setSuggestionType,
    suggestionMessage,
    setSuggestionMessage,
    suggestionLoading,
    isSuggestionFormValid,
    showBugReportModal,
    setShowBugReportModal,
    bugType,
    setBugType,
    bugDetails,
    setBugDetails,
    bugImage,
    setBugImage,
    bugImageFile,
    setBugImageFile,
    bugLoading,
    bugUploading,
    isBugFormValid,
    isHelpExpanded,
    setIsHelpExpanded,
    helpTab,
    setHelpTab,
    faqs,
    expandedFaq,
    setExpandedFaq,
    faqQuestion,
    setFaqQuestion,
    faqAnswer,
    setFaqAnswer,
    faqLoading,
    contactForm,
    setContactForm,
    contactSubmitted,
    setContactSubmitted,
    contactLoading,
    fetchUserRequestsAndReports,
    handleRetractProposal,
    handleRetractReport,
    handleDeleteFeedback,
    handleSendSuggestion,
    handleBugImageChange,
    handleSendBugReport,
    handleAddFAQ,
    handleDeleteFAQ,
    handleContactSubmit,
  };
};

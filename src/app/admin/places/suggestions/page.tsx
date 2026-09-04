"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "../../../admin.module.css";
import { useAuth } from "@/context/AuthContext";
import CustomModal from "@/components/common/Modals";
import { CATEGORIES_STRUCTURE } from "@/data/places";
import { FaMapPin, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { BiSolidMapPin } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

const AVAILABLE_INTERESTS_MAP: Record<string, { label: string; icon: string }> = {
  restaurants: { label: "مطاعم", icon: "bx bx-restaurant" },
  drinks: { label: "مشروبات", icon: "bx bx-coffee" },
  family: { label: "اماكن عائلية", icon: "bx bx-home-heart" },
  kids: { label: "اماكن للأطفال", icon: "bx bx-child" },
  hotels_aqua: { label: "فنادق واكوا بارك", icon: "bx bx-building-house" },
  activities: { label: "أنشطة وترفيه", icon: "bx bx-party" },
  offers: { label: "اقوي العروض", icon: "bx bxs-discount" },
  cinema: { label: "السينما", icon: "bx bx-camera-movie" },
  medical: { label: "خدمات طبية", icon: "bx bx-plus-medical" },
  health_beauty: { label: "الصحة والجمال", icon: "bx bx-spa" },
  parks: { label: "الحدائق", icon: "bx bx-tree" },
  work: { label: "شغل", icon: "bx bx-briefcase" },
  courses_study: { label: "كورسات ودراسة", icon: "bx bx-book-reader" },
  quiet_places: { label: "اماكن هادئه", icon: "bx bx-moon" }
};

const getInterestObj = (intKey: string) => {
  if (AVAILABLE_INTERESTS_MAP[intKey]) return AVAILABLE_INTERESTS_MAP[intKey];
  const found = Object.values(AVAILABLE_INTERESTS_MAP).find(item => item.label === intKey);
  if (found) return found;
  return { label: intKey, icon: "bx bx-star" };
};

const CATEGORY_ICONS: Record<string, string> = {
  all: "bx-grid-alt",
};

CATEGORIES_STRUCTURE.forEach(main => {
  CATEGORY_ICONS[main.name] = main.icon;
  main.subCategories.forEach(sub => {
    CATEGORY_ICONS[sub.name] = sub.icon;
  });
});

function getCategoryColor(cat: string) {
  const mainCat = CATEGORIES_STRUCTURE.find(m => m.name === cat || m.subCategories.some(s => s.name === cat));
  return mainCat?.color ?? "var(--colorPrimary, #6c63ff)";
}

const CATEGORY_MAP: Record<string, string> = {};
CATEGORIES_STRUCTURE.forEach(main => {
  CATEGORY_MAP[main.name] = main.label;
  main.subCategories.forEach(sub => {
    CATEGORY_MAP[sub.name] = sub.label;
  });
});

function ImageWithSkeleton({ src, alt, style, className, onClick, onError }: any) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", ...style, overflow: "hidden" }} className={className} onClick={onClick}>
      {!loaded && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bgGlass-card)", animation: "pulse 1.5s infinite" }} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: style?.objectFit || "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)}
        onError={(e: any) => {
          setLoaded(true);
          if (onError) onError(e);
        }}
      />
    </div>
  );
}

export default function PlacesSuggestionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposalDetails, setSelectedProposalDetails] = useState<any | null>(null);
  const [proposalsFilter, setProposalsFilter] = useState<"pending" | "approved" | "rejected" | "retracted" | "all">("pending");
  const [rejectingProposal, setRejectingProposal] = useState<any | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [isProcessingProposal, setIsProcessingProposal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
  const [proposalsError, setProposalsError] = useState<string | null>(null);
  const [isConfirmingClearApproved, setIsConfirmingClearApproved] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const showFeedback = (title: string, message: string, type: "success" | "error" | "warning" = "success") => {
    setFeedbackModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const fetchProposals = async () => {
    if (!supabase) return;
    setProposalsError(null);
    try {
      // 1. Try to permanently delete any items marked as deleted from the database
      await supabase.from("place_proposals").delete().eq("status", "deleted");

      // 2. Fetch proposals excluding any marked as deleted
      const { data, error } = await supabase
        .from("place_proposals")
        .select("*")
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Proposals fetch error:", error);
        setProposalsError("خطأ من Supabase: " + error.message);
      } else if (data) {
        // Filter out deleted items, keep all active, approved, rejected, and retracted
        const validProposals = data.filter(p => p.status !== "deleted");
        const userIds = Array.from(new Set(validProposals.map(p => p.user_id).filter(Boolean)));
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          const profilesMap = new Map((profilesData || []).map(pr => [pr.id, pr]));
          const proposalsWithProfiles = validProposals.map(p => ({
            ...p,
            user_profile: profilesMap.get(p.user_id) || null
          }));
          setProposals(proposalsWithProfiles);
        } else {
          setProposals(validProposals);
        }
      }
    } catch (err: any) {
      console.error("Proposals fetch exception:", err);
      setProposalsError("خطأ في الاتصال: " + (err.message || "حدث خطأ غير معروف"));
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdminAndFetch = async () => {
      if (!supabase) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.is_admin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        await fetchProposals();
      } catch (err: any) {
        setError(err.message || "حدث خطأ غير معروف.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user, authLoading, router]);

  const handleApproveProposal = async (proposal: any) => {
    if (!supabase) return;
    setIsProcessingProposal(true);
    setError("");
    try {
      const imagesArr = (proposal.images && proposal.images.length > 0)
        ? proposal.images
        : (proposal.image_url ? [proposal.image_url] : []);

      const phonesArr = proposal.phone ? [proposal.phone] : [];

      const newPlaceObj = {
        name: proposal.name,
        category: proposal.category,
        category_label: proposal.category_label || proposal.category,
        sub_categories: proposal.sub_categories || [],
        place_type: proposal.place_type || null,
        place_type_icon: proposal.place_type_icon || null,
        governorate: proposal.governorate,
        city: proposal.city,
        short_description: proposal.description ? proposal.description.substring(0, 80) : "",
        full_address: proposal.address || "",
        phones: phonesArr,
        google_maps_url: proposal.location_url || "",
        images: imagesArr,
        menu_images: [],
        description: proposal.description || "",
        working_hours: JSON.stringify({ type: "24/7" }),
        services: proposal.services || [],
        features: proposal.features || []
      };

      const { data: insertedPlace, error: insertError } = await supabase
        .from("places")
        .insert([newPlaceObj])
        .select()
        .single();

      if (insertError) throw insertError;

      if (insertedPlace) {
        await supabase.from("branches").insert([{
          place_id: insertedPlace.id,
          name: "الفرع الرئيسي",
          governorate: insertedPlace.governorate,
          city: insertedPlace.city,
          full_address: insertedPlace.full_address || "",
          phones: insertedPlace.phones || [],
          google_maps_url: insertedPlace.google_maps_url || "",
          working_hours: insertedPlace.working_hours || JSON.stringify({ type: "24/7" }),
          services: insertedPlace.services || []
        }]);
      }

      const { error: updateError } = await supabase
        .from("place_proposals")
        .update({ status: "approved", rejection_reason: null, updated_at: new Date().toISOString() })
        .eq("id", proposal.id);

      if (updateError) throw updateError;

      const newPlaceId = insertedPlace?.id || "";
      await supabase.from("notifications").insert([{
        user_id: proposal.user_id,
        title: "🎉 تهانينا! تم قبول مكانك المقترح",
        message: `تهانينا! تمت مراجعة واعتماد إدراج المكان "${proposal.name}" ونشره رسمياً على التطبيق.`,
        type: "system",
        is_read: false,
        link: newPlaceId ? `/places/${newPlaceId}` : "/profile"
      }]);

      showFeedback("تم النشر بنجاح", `تمت الموافقة ونشر المكان "${proposal.name}" بنجاح!`, "success");
      fetchProposals();
    } catch (err: any) {
      showFeedback("خطأ في الاعتماد", "حدث خطأ أثناء اعتماد المكان: " + (err.message || ""), "error");
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!supabase || !rejectingProposal) return;
    if (!rejectionReasonInput.trim()) {
      showFeedback("تنبيه", "يرجى كتابة سبب الرفض لتوضيحه للمستخدم.", "warning");
      return;
    }

    setIsProcessingProposal(true);
    setError("");
    try {
      // 1. Update proposal status to rejected in database
      const { error: updateError } = await supabase
        .from("place_proposals")
        .update({
          status: "rejected",
          rejection_reason: rejectionReasonInput.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", rejectingProposal.id);

      if (updateError) throw updateError;

      // 2. Send notification to user with reason and edit link
      if (rejectingProposal.user_id) {
        await supabase.from("notifications").insert([{
          user_id: rejectingProposal.user_id,
          title: "⚠️ تم رفض اقتراح المكان",
          message: `نأسف، لم نتمكن من إدراج المكان "${rejectingProposal.name}". السبب: ${rejectionReasonInput.trim()}. يمكنك تعديل بيانات الاقتراح وإعادة إرساله.`,
          type: "system",
          is_read: false,
          link: `/propose-place?edit=${rejectingProposal.id}`
        }]);
      }

      showFeedback("تم الرفض بنجاح", `تم رفض المقترح وإبلاغ المستخدم بالسبب. يمكنك حذفه يدوياً في أي وقت.`, "success");
      setRejectingProposal(null);
      setRejectionReasonInput("");
      fetchProposals();
    } catch (err: any) {
      showFeedback("خطأ", "حدث خطأ أثناء رفض الطلب: " + (err.message || ""), "error");
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleClearAllApproved = async () => {
    if (!supabase) return;
    setIsProcessingProposal(true);
    setError("");
    try {
      // 1. Try hard delete
      const { data: delData, error: deleteError } = await supabase
        .from("place_proposals")
        .delete()
        .eq("status", "approved")
        .select();

      // If RLS blocked hard delete, update status to deleted as fallback
      if (!delData || delData.length === 0) {
        await supabase
          .from("place_proposals")
          .update({ status: "deleted", updated_at: new Date().toISOString() })
          .eq("status", "approved");
      }

      setProposals(prev => prev.filter(p => p.status !== "approved"));
      setIsConfirmingClearApproved(false);
      showFeedback("تم الإفراغ بنجاح", "تم إفراغ وحذف جميع الاقتراحات المقبولة بنجاح.", "success");
      fetchProposals();
    } catch (err: any) {
      showFeedback("خطأ", "حدث خطأ أثناء إفراغ الاقتراحات المقبولة: " + (err.message || ""), "error");
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleDeleteProposal = (proposalId: string) => {
    setProposalToDelete(proposalId);
  };

  const handleConfirmDeleteProposal = async () => {
    if (!supabase || !proposalToDelete) return;
    setIsProcessingProposal(true);
    setError("");
    try {
      // 1. Try hard delete
      const { data: delData, error: deleteError } = await supabase
        .from("place_proposals")
        .delete()
        .eq("id", proposalToDelete)
        .select();

      // If RLS blocked hard delete, update status to deleted as fallback
      if (!delData || delData.length === 0) {
        await supabase
          .from("place_proposals")
          .update({ status: "deleted", updated_at: new Date().toISOString() })
          .eq("id", proposalToDelete);
      }

      setProposals(prev => prev.filter(p => p.id !== proposalToDelete));
      setProposalToDelete(null);
      setSelectedProposalDetails(null);
      showFeedback("تم الحذف بنجاح", "تم حذف الاقتراح بنجاح.", "success");
      fetchProposals();
    } catch (err: any) {
      showFeedback("خطأ", "حدث خطأ أثناء حذف الاقتراح: " + (err.message || ""), "error");
    } finally {
      setIsProcessingProposal(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
        <div>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🚫</h1>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#ff3b30", marginBottom: "10px" }}>صلاحيات غير كافية</h2>
          <p style={{ color: "var(--textSecondary)" }}>عذراً، هذه الصفحة مخصصة للمشرفين فقط.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: "120px 10px", paddingTop: "60px", maxWidth: "100%", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
        <div>
          <h1 className="title-ios">اقتراحات الأماكن</h1>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "12px 16px", borderRadius: "14px", color: "#ff3b30", fontSize: "0.85rem", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── PROPOSALS MODERATION SECTION ─── */}
      <div className="glass-panel" style={{ padding: "28px 20px", borderRadius: "15px", marginBottom: "32px", border: "1px solid rgba(108, 99, 255, 0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <i className="bx bx-map-pin" style={{ color: "var(--colorPrimary)" }}></i> مراجعة اقتراحات الأماكن
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={fetchProposals}
              className="btn"
              style={{ padding: "6px 14px", fontSize: "0.82rem", background: "rgba(108, 99, 255, 0.15)", color: "var(--colorPrimary)" }}
            >
              🔄 تحديث
            </button>
          </div>
        </div>

        {proposalsError && (
          <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "12px 16px", borderRadius: "14px", color: "#ff3b30", fontSize: "0.85rem", marginBottom: "16px" }}>
            ⚠️ {proposalsError}
          </div>
        )}

        {/* Proposal Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { id: "pending", label: "المعلقة", count: proposals.filter(p => p.status === "pending").length },
            { id: "approved", label: "المقبولة", count: proposals.filter(p => p.status === "approved").length },
            { id: "rejected", label: "المرفوضة", count: proposals.filter(p => p.status === "rejected").length },
            { id: "retracted", label: "المتراجع عنها", count: proposals.filter(p => p.status === "retracted").length },
            { id: "all", label: "الكل", count: proposals.length },
          ].map(tab => (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => setProposalsFilter(tab.id as any)}
                className="btn"
                style={{
                  padding: "7px 14px",
                  fontSize: "0.85rem",
                  background: proposalsFilter === tab.id ? "rgba(108, 99, 255, 0.25)" : "var(--bgGlass)",
                  color: proposalsFilter === tab.id ? "var(--colorPrimary)" : "var(--textSecondary)",
                  border: proposalsFilter === tab.id ? "1px solid var(--colorPrimary)" : "1px solid var(--borderGlass)"
                }}
              >
                {tab.label} ({tab.count})
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Proposals Grid */}
        {proposals.filter(p => proposalsFilter === "all" || p.status === proposalsFilter).length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            لا توجد اقتراحات في قسم ({proposalsFilter === "pending" ? "المعلقة" : proposalsFilter === "approved" ? "المقبولة" : proposalsFilter === "rejected" ? "المرفوضة" : proposalsFilter === "retracted" ? "المتراجع عنها" : "الكل"}) حالياً.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {proposals
              .filter(p => proposalsFilter === "all" || p.status === proposalsFilter)
              .map((prop) => (
                <div
                  key={prop.id}
                  className="glass-card"
                  onClick={() => setSelectedProposalDetails(prop)}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    borderRadius: "18px",
                    border: "1px solid var(--borderGlass)",
                    background: "var(--bgGlass-card)",
                    transition: "transform 0.2s, background-color 0.2s",
                    minHeight: "360px"
                  }}
                >
                  <div style={{ width: "100%", height: "180px", position: "relative", overflow: "hidden" }}>
                    <ImageWithSkeleton
                      src={(prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image_url || "")}
                      alt={prop.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e: any) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"; }}
                    />
                    {/* Category badge */}
                    <span style={{ position: "absolute", top: "12px", right: "12px", background: getCategoryColor(prop.category), color: "#fff", fontSize: "0.78rem", fontWeight: "700", padding: "5px 10px", borderRadius: "10px", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", gap: "5px", zIndex: 2 }}>
                      <i className={`bx ${CATEGORY_ICONS[prop.category] || "bx-category"}`} style={{ fontSize: "0.95rem" }}></i> {prop.category_label || prop.category}
                    </span>
                    {/* Status badge */}
                    <span style={{ position: "absolute", top: "12px", left: "12px", background: prop.status === 'approved' ? "rgba(52, 199, 89, 0.85)" : prop.status === 'rejected' ? "rgba(255, 59, 48, 0.85)" : prop.status === 'retracted' ? "rgba(142, 142, 147, 0.85)" : "rgba(255, 149, 0, 0.85)", color: "#fff", fontSize: "0.78rem", fontWeight: "700", padding: "5px 10px", borderRadius: "10px", backdropFilter: "blur(5px)", zIndex: 2 }}>
                      {prop.status === 'approved' ? "مقبول" : prop.status === 'rejected' ? "مرفوض" : prop.status === 'retracted' ? "متراجع" : "قيد المراجعة"}
                    </span>
                  </div>

                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "800", margin: 0, color: "var(--textPrimary)" }}>{prop.name}</h3>

                    {prop.description && (
                      <p style={{ color: "var(--textSecondary)", fontSize: "0.85rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {prop.description}
                      </p>
                    )}

                    <p style={{ color: "var(--textSecondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px", margin: 0 }}>
                      <span><FaMapPin style={{ color: "var(--colorPrimary)" }} /></span> {prop.city} / {prop.governorate}
                    </p>

                    {/* Proposer Info Bar */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ background: "rgba(108, 99, 255, 0.06)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "6px 10px", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img
                          src={prop.user_profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"}
                          alt="proposer avatar"
                          loading="lazy"
                          decoding="async"
                          style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                            {prop.user_profile?.full_name || prop.user_profile?.username || "مستخدم ماب القاهرة"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUserProfile(prop.user_profile || { id: prop.user_id })}
                        className="btn"
                        style={{ padding: "3px 8px", fontSize: "0.7rem", background: "rgba(108, 99, 255, 0.15)", color: "var(--colorPrimary)", border: "none", fontWeight: "700" }}
                      >
                        👤 البروفايل
                      </button>
                    </div>

                    {/* Action Buttons: manual delete enabled for ALL statuses */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                    >
                      {prop.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApproveProposal(prop)}
                            disabled={isProcessingProposal}
                            className="btn"
                            style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg, #34c759, #00d4aa)", color: "#fff", fontWeight: "700", border: "none", fontSize: "0.85rem" }}
                          >
                            ✓ نشر
                          </button>
                          <button
                            onClick={() => { setRejectingProposal(prop); setRejectionReasonInput(""); }}
                            disabled={isProcessingProposal}
                            className="btn"
                            style={{ flex: 1, padding: "8px", background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", fontWeight: "700", border: "1px solid rgba(255, 59, 48, 0.3)", fontSize: "0.85rem" }}
                          >
                            ✕ رفض
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProposal(prop.id)}
                            disabled={isProcessingProposal}
                            className="btn"
                            title="حذف الاقتراح نهائياً"
                            style={{ padding: "8px 12px", background: "rgba(255, 59, 48, 0.12)", color: "#ff3b30", fontWeight: "700", border: "1px solid rgba(255, 59, 48, 0.3)", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <i className="bx bx-trash" style={{ fontSize: "1.1rem" }}></i>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteProposal(prop.id)}
                          disabled={isProcessingProposal}
                          className="btn"
                          style={{ flex: 1, padding: "8px", background: "rgba(255, 59, 48, 0.12)", color: "#ff3b30", fontWeight: "700", border: "1px solid rgba(255, 59, 48, 0.3)", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                          <i className="bx bx-trash" style={{ fontSize: "1rem" }}></i> حذف الاقتراح
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal for Suggested Place Full Details (iOS style sheet) */}
      {selectedProposalDetails && (
        <div className="ios-sheet-overlay" onClick={() => setSelectedProposalDetails(null)}>
          <div className="ios-sheet" style={{ maxWidth: "100%" }} onClick={(e: any) => e.stopPropagation()}>
            <div className="ios-sheet-drag-handle" onClick={() => setSelectedProposalDetails(null)} />

            {/* Top Bar (Fixed) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", borderBottom: "1px solid var(--borderGlass)", flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "10px", background: selectedProposalDetails.status === 'approved' ? "rgba(52, 199, 89, 0.2)" : selectedProposalDetails.status === 'rejected' ? "rgba(255, 59, 48, 0.2)" : selectedProposalDetails.status === 'retracted' ? "rgba(142, 142, 147, 0.2)" : "rgba(255, 149, 0, 0.2)", color: selectedProposalDetails.status === 'approved' ? "#34c759" : selectedProposalDetails.status === 'rejected' ? "#ff3b30" : selectedProposalDetails.status === 'retracted' ? "#8e8e93" : "#ff9500", fontWeight: "700" }}>
                  {selectedProposalDetails.status === 'approved' ? "معتمد ومقبول" : selectedProposalDetails.status === 'rejected' ? "مرفوض" : selectedProposalDetails.status === 'retracted' ? "متراجع عنه" : "قيد المراجعة"}
                </span>
              </div>

              <div style={{ textAlign: "center", flex: 1, minWidth: 0, padding: "0 10px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--textPrimary)" }}>
                  {selectedProposalDetails.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {selectedProposalDetails.category_label || selectedProposalDetails.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedProposalDetails(null)}
                style={{
                  background: "rgba(109, 107, 107, 0.12)",
                  border: "1px solid var(--borderGlass)",
                  color: "var(--textPrimary)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  transition: "all 0.2s"
                }}
                title="إغلاق"
              >
                <IoMdClose />
              </button>
            </div>

            <div className="ios-sheet-content">
              {(() => {
                const propImages = (selectedProposalDetails.images && selectedProposalDetails.images.length > 0)
                  ? selectedProposalDetails.images
                  : (selectedProposalDetails.image_url ? [selectedProposalDetails.image_url] : []);
                return (
                  <>
                    {/* Images Carousel */}
                    {propImages.length > 0 ? (
                      <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "20px", scrollbarWidth: "none" }}>
                        {propImages.map((img: string, i: number) => (
                          <ImageWithSkeleton key={i} src={img} alt={`${selectedProposalDetails.name} ${i + 1}`}
                            style={{ width: "100%", minWidth: "100%", height: "230px", objectFit: "cover", borderRadius: "12px", flexShrink: 0 }}
                            onError={(e: any) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"; }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: "200px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--borderGlass)", marginBottom: "20px" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>لا توجد صور متوفرة للمكان</span>
                      </div>
                    )}

                    {/* Title Area */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", margin: "0 0 6px" }}>
                        {selectedProposalDetails.name}
                      </h2>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        <span><FaMapMarkerAlt /> {selectedProposalDetails.city} / {selectedProposalDetails.governorate}</span>
                      </div>
                    </div>

                    {/* Quick Info / Action Row */}
                    <div style={{ display: "grid", gridTemplateColumns: selectedProposalDetails.status === 'pending' ? "repeat(5, 1fr)" : "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
                      {/* Directions */}
                      <a
                        href={selectedProposalDetails.location_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProposalDetails.name + ' ' + selectedProposalDetails.city)}`}
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
                          justifyContent: "center",
                          gap: "2px",
                          cursor: "pointer",
                          textDecoration: "none",
                          textAlign: "center",
                          transition: "opacity 0.2s"
                        }}
                      >
                        <BiSolidMapPin style={{ fontSize: "1.1rem" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>الاتجاهات</span>
                      </a>

                      {/* Phone */}
                      {selectedProposalDetails.phone ? (
                        <a
                          href={`tel:${selectedProposalDetails.phone}`}
                          style={{
                            background: "rgba(0, 122, 255, 0.08)",
                            border: "1px solid var(--borderGlass)",
                            color: "#007aff",
                            borderRadius: "12px",
                            padding: "8px 6px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                            cursor: "pointer",
                            textDecoration: "none",
                            textAlign: "center",
                            transition: "opacity 0.2s"
                          }}
                        >
                          <FaPhoneAlt style={{ fontSize: "1rem" }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>الهاتف</span>
                        </a>
                      ) : (
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid var(--borderGlass)",
                            color: "var(--text-muted)",
                            borderRadius: "12px",
                            padding: "8px 6px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                            opacity: 0.5,
                            textAlign: "center"
                          }}
                        >
                          <FaPhoneAlt style={{ fontSize: "1rem" }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>بلا هاتف</span>
                        </div>
                      )}

                      {/* Approve & Reject for Pending status inside detail sheet */}
                      {selectedProposalDetails.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              handleApproveProposal(selectedProposalDetails);
                              setSelectedProposalDetails(null);
                            }}
                            disabled={isProcessingProposal}
                            style={{
                              background: "linear-gradient(135deg, #34c759, #00d4aa)",
                              color: "#fff",
                              borderRadius: "12px",
                              padding: "8px 6px",
                              border: "none",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "2px",
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "opacity 0.2s"
                            }}
                          >
                            <span style={{ fontSize: "1.1rem" }}>✓</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>موافقة ونشر</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingProposal(selectedProposalDetails);
                              setRejectionReasonInput("");
                              setSelectedProposalDetails(null);
                            }}
                            disabled={isProcessingProposal}
                            style={{
                              background: "rgba(255, 59, 48, 0.15)",
                              border: "1px solid rgba(255, 59, 48, 0.3)",
                              color: "#ff3b30",
                              borderRadius: "12px",
                              padding: "8px 6px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "2px",
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "opacity 0.2s"
                            }}
                          >
                            <span style={{ fontSize: "1.1rem" }}>✕</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>رفض</span>
                          </button>
                        </>
                      )}

                      {/* Delete button available for ANY status inside detail sheet */}
                      <button
                        onClick={() => {
                          handleDeleteProposal(selectedProposalDetails.id);
                        }}
                        disabled={isProcessingProposal}
                        style={{
                          background: "rgba(255, 59, 48, 0.15)",
                          border: "1px solid rgba(255, 59, 48, 0.3)",
                          color: "#ff3b30",
                          borderRadius: "12px",
                          padding: "8px 6px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2px",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "opacity 0.2s"
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>🗑️</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>حذف الاقتراح</span>
                      </button>
                    </div>

                    {/* Proposer Banner Card */}
                    <div style={{ marginBottom: "24px" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--textPrimary)" }}>صاحب الاقتراح</h3>
                      <div style={{ background: "rgba(108, 99, 255, 0.08)", border: "1px solid rgba(108, 99, 255, 0.2)", borderRadius: "14px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={selectedProposalDetails.user_profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"}
                            alt="proposer avatar"
                            loading="lazy"
                            decoding="async"
                            style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--colorPrimary)" }}
                          />
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                              {selectedProposalDetails.user_profile?.full_name || selectedProposalDetails.user_profile?.username || "مستخدم ماب القاهرة"}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              تاريخ تقديم الاقتراح: {selectedProposalDetails.created_at ? new Date(selectedProposalDetails.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ""}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserProfile(selectedProposalDetails.user_profile || { id: selectedProposalDetails.user_id });
                            setSelectedProposalDetails(null);
                          }}
                          className="btn"
                          style={{ padding: "6px 14px", fontSize: "0.82rem", background: "rgba(108, 99, 255, 0.2)", color: "var(--colorPrimary)", border: "none", fontWeight: "700" }}
                        >
                          👤 عرض البروفايل الكامل
                        </button>
                      </div>
                    </div>

                    {/* Description Section */}
                    {selectedProposalDetails.description && (
                      <div style={{ marginBottom: "24px" }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--textPrimary)" }}>الوصف</h3>
                        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--borderGlass)", borderRadius: "14px", padding: "16px 20px", color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                          {selectedProposalDetails.description}
                        </div>
                      </div>
                    )}

                    {/* Services section */}
                    {selectedProposalDetails.services && selectedProposalDetails.services.length > 0 && (
                      <div style={{ marginBottom: "24px" }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--textPrimary)" }}>الخدمات المتاحة</h3>
                        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--borderGlass)", borderRadius: "14px", padding: "16px 20px" }}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {selectedProposalDetails.services.map((serviceName: string) => (
                              <span
                                key={serviceName}
                                style={{
                                  background: "rgba(0, 111, 238, 0.08)",
                                  color: "var(--colorPrimary)",
                                  border: "1px solid rgba(0, 111, 238, 0.2)",
                                  padding: "6px 14px",
                                  borderRadius: "20px",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                <i className="bx bx-check-double" style={{ fontSize: "1rem" }}></i>
                                {serviceName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Details Card (Phone, Maps Link, Address) */}
                    <div style={{ marginBottom: "24px" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--textPrimary)" }}>التفاصيل الجغرافية والاتصال</h3>
                      <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--borderGlass)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        {/* Phone Row */}
                        {selectedProposalDetails.phone && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(120, 120, 120, 0.1)" }}>
                            <span style={{ fontSize: "0.9rem", color: "var(--textSecondary)" }}>رقم الهاتف المعتمد للمقترح</span>
                            <a href={`tel:${selectedProposalDetails.phone}`} style={{ fontSize: "0.92rem", color: "#007aff", textDecoration: "none", fontWeight: "bold", direction: "ltr" }}>
                              {selectedProposalDetails.phone}
                            </a>
                          </div>
                        )}

                        {/* Location Link Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(120, 120, 120, 0.1)" }}>
                          <span style={{ fontSize: "0.9rem", color: "var(--textSecondary)" }}>موقع Google Maps</span>
                          {selectedProposalDetails.location_url ? (
                            <a href={selectedProposalDetails.location_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.92rem", color: "#007aff", textDecoration: "none", fontWeight: "bold", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr" }}>
                              رابط الموقع الجغرافي
                            </a>
                          ) : (
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>غير متوفر</span>
                          )}
                        </div>

                        {/* Full Address Row */}
                        <div style={{ display: "flex", flexDirection: "column", padding: "14px 16px" }}>
                          <span style={{ fontSize: "0.9rem", color: "var(--textSecondary)", marginBottom: "6px" }}>العنوان بالتفصيل</span>
                          <span style={{ fontSize: "0.95rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                            {selectedProposalDetails.address || "لا يوجد عنوان تفصيلي مكتوب"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason section (if rejected) */}
                    {selectedProposalDetails.status === 'rejected' && selectedProposalDetails.rejection_reason && (
                      <div style={{ marginBottom: "24px", border: "1px solid rgba(255, 59, 48, 0.3)", borderRadius: "14px", overflow: "hidden" }}>
                        <div style={{ background: "rgba(255, 59, 48, 0.1)", padding: "12px 16px", borderBottom: "1px solid rgba(255, 59, 48, 0.2)" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#ff3b30", display: "flex", alignItems: "center", gap: "6px" }}>
                            ⚠️ سبب رفض هذا المقترح
                          </span>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px 20px", fontSize: "0.92rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                          {selectedProposalDetails.rejection_reason}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Proposer Full Profile */}
      {selectedUserProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-panel" style={{ maxWidth: "480px", width: "100%", padding: "10px 28px", borderRadius: "24px", background: "var(--bgGlass-card, #ffffff)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", border: "1px solid var(--colorPrimary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            </div>

            {/* Profile Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "16px", marginBottom: "20px", border: "1px solid var(--borderGlass)" }}>
              <img
                src={selectedUserProfile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                alt="Profile Avatar"
                loading="lazy"
                decoding="async"
                style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--colorPrimary)" }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                  {selectedUserProfile.full_name || "غير محدد"}
                </h4>
                <div style={{ fontSize: "0.85rem", color: "var(--colorPrimary)", direction: "ltr", textAlign: "right" }}>
                  @{selectedUserProfile.username || "بدون_اسم_مستخدم"}
                </div>
              </div>
            </div>

            {/* Profile Details List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--textSecondary)", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "10px" }}>
                <span>📧 البريد الإلكتروني:</span>
                <strong style={{ color: "var(--textPrimary)" }}>{selectedUserProfile.email || "غير متوفر"}</strong>
              </div>

              {selectedUserProfile.phone && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "10px" }}>
                  <span>📞 رقم الهاتف:</span>
                  <strong style={{ color: "var(--textPrimary)", direction: "ltr" }}>{selectedUserProfile.phone}</strong>
                </div>
              )}

              {(selectedUserProfile.governorate || selectedUserProfile.city) && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "10px" }}>
                  <span>📍 المحافظة / المدينة:</span>
                  <strong style={{ color: "var(--textPrimary)" }}>{selectedUserProfile.governorate || ""} {selectedUserProfile.city ? `(${selectedUserProfile.city})` : ""}</strong>
                </div>
              )}

              {selectedUserProfile.dob && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "10px" }}>
                  <span>🎂 تاريخ الميلاد:</span>
                  <strong style={{ color: "var(--textPrimary)" }}>{selectedUserProfile.dob}</strong>
                </div>
              )}

              {selectedUserProfile.interests && selectedUserProfile.interests.length > 0 && (
                <div style={{ padding: "10px 14px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "12px" }}>
                  <div style={{ marginBottom: "8px", fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.88rem" }}>🎯 الاهتمامات:</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedUserProfile.interests.map((intKey: string, i: number) => {
                      const item = getInterestObj(intKey);
                      return (
                        <span
                          key={i}
                          style={{
                            fontSize: "0.82rem",
                            background: "rgba(108, 99, 255, 0.15)",
                            color: "var(--colorPrimary)",
                            border: "1px solid rgba(108, 99, 255, 0.3)",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600"
                          }}
                        >
                          <i className={item.icon} style={{ fontSize: "1rem" }}></i>
                          <span>{item.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedUserProfile.bio && (
                <div style={{ padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "10px" }}>
                  <div style={{ marginBottom: "4px" }}>📝 نبذة شخصية:</div>
                  <div style={{ color: "var(--textPrimary)", fontStyle: "italic" }}>"{selectedUserProfile.bio}"</div>
                </div>
              )}

              {selectedUserProfile.created_at && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--borderGlass)", borderRadius: "10px" }}>
                  <span>📅 تاريخ الانضمام:</span>
                  <strong style={{ color: "var(--textPrimary)" }}>
                    {new Date(selectedUserProfile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUserProfile(null)}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontWeight: "700" }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Modal for Rejection Reason */}
      <CustomModal
        isOpen={Boolean(rejectingProposal)}
        onClose={() => !isProcessingProposal && setRejectingProposal(null)}
        title="تأكيد رفض الاقتراح"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/alert.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message={rejectingProposal ? `سبب رفض المكان: « ${rejectingProposal.name} »` : undefined}
        primaryButton={{
          label: isProcessingProposal ? "جاري الحفظ..." : "تأكيد الرفض",
          onClick: handleConfirmRejection,
          bgColor: "#ff3b30",
          disabled: isProcessingProposal || !rejectionReasonInput.trim(),
          icon: <i className="bx bx-x-circle" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setRejectingProposal(null),
          bgColor: "var(--cancelBtn)",
          disabled: isProcessingProposal,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--textSecondary)", marginBottom: "12px", lineHeight: "1.5" }}>
            يرجى توضيح سبب الرفض بالتفصيل للمستخدم. سيتم إرسال إشعار له يوضح السبب مع إمكانية تعديل الاقتراح.
          </p>
          <textarea
            rows={4}
            required
            placeholder="اكتب سبب الرفض هنا..."
            className="input-fields"
            value={rejectionReasonInput}
            onChange={(e) => setRejectionReasonInput(e.target.value)}
            style={{ width: "100%", resize: "vertical", direction: "rtl", fontFamily: "var(--font-cairo)" }}
          />
        </div>
      </CustomModal>


      {/* Modal for Confirming Single Proposal Deletion */}
      <CustomModal
        isOpen={Boolean(proposalToDelete)}
        onClose={() => !isProcessingProposal && setProposalToDelete(null)}
        title="تأكيد حذف الاقتراح"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message="هل أنت متأكد من رغبتك في حذف هذا الاقتراح نهائياً من قاعدة البيانات؟"
        primaryButton={{
          label: isProcessingProposal ? "جاري ..." : "تأكيد ",
          onClick: handleConfirmDeleteProposal,
          bgColor: "#ff3b30",
          disabled: isProcessingProposal,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setProposalToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isProcessingProposal,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      />

      {/* Centered Professional Alert / Feedback Modal */}
      {feedbackModal && (
        <CustomModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal(null)}
          title={feedbackModal.title}
          titleColor={
            feedbackModal.type === "success"
              ? "#34c759"
              : feedbackModal.type === "error"
              ? "#ff3b30"
              : "#ff9500"
          }
          iconNode={
            feedbackModal.type === "success" ? (
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(52, 199, 89, 0.2), rgba(0, 212, 170, 0.15))",
                  border: "2px solid #34c759",
                  color: "#34c759",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.2rem",
                  boxShadow: "0 8px 24px rgba(52, 199, 89, 0.3)"
                }}
              >
                ✓
              </div>
            ) : undefined
          }
          iconSrc={
            feedbackModal.type === "error" || feedbackModal.type === "warning"
              ? "/images/icons3d/alert.png"
              : undefined
          }
          borderColor={
            feedbackModal.type === "success"
              ? "rgba(52, 199, 89, 0.3)"
              : feedbackModal.type === "error"
              ? "rgba(255, 59, 48, 0.3)"
              : "rgba(255, 149, 0, 0.3)"
          }
          message={feedbackModal.message}
          primaryButton={{
            label: "حسناً",
            onClick: () => setFeedbackModal(null),
            bgColor:
              feedbackModal.type === "success"
                ? "linear-gradient(135deg, #34c759, #00d4aa)"
                : feedbackModal.type === "error"
                ? "#ff3b30"
                : "#ff9500",
            icon:
              feedbackModal.type === "success" ? (
                <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
              ) : (
                <i className="bx bx-info-circle" style={{ fontSize: "1.2rem" }} />
              )
          }}
        />
      )}
    </div>
  );
}

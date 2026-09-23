"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

import { useProposePlace } from "./hooks/useProposePlace";
import ProposePlaceHero from "./components/ProposePlaceHero";
import ProposePlaceAlerts from "./components/ProposePlaceAlerts";
import ProposePlaceForm from "./components/ProposePlaceForm";
import ProposePlaceSuccess from "./components/ProposePlaceSuccess";
import ProposePlaceHistory from "./components/ProposePlaceHistory";
import ProposePlaceLoading from "./components/ProposePlaceLoading";
import styles from "./propose-place.module.css";

function ProposePlaceContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    formData,
    setFormData,
    categories,
    loading,
    initialFetching,
    success,
    errorMsg,
    rejectionReason,
    limitChecking,
    limitReached,
    userProposals,
    proposalsLoading,
    editId,
    newImgInput,
    setNewImgInput,
    isUploadingImg,
    handleCategoryChange,
    handleAddImage,
    handleFileUpload,
    handleRemoveImage,
    resetForm,
    cancelEdit,
    fetchUserProposals,
    handleSubmit,
  } = useProposePlace(user, authLoading);

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useEffect(() => {
    if (authLoading || initialFetching || limitChecking) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const elements = [formRef.current, historyRef.current].filter(Boolean);
      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.08 }
        );
      }
    });

    return () => ctx.revert();
  }, [authLoading, initialFetching, limitChecking]);

  const handleSelectEdit = (id: string) => {
    router.push(`/propose-place?edit=${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading || initialFetching || limitChecking) {
    return <ProposePlaceLoading />;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Background Ambient Glow */}
      <div className={styles.ambientGlow} />

      {/* Main Content Area */}
      <div className={styles.contentContainer}>
        {/* Hero Section */}
        <ProposePlaceHero
          headerRef={headerRef}
          isEditMode={Boolean(editId)}
          proposalsCount={userProposals.length}
        />

        {/* Dynamic Alerts (Edit Mode, Pending Limit, Rejection Reason) */}
        <ProposePlaceAlerts
          editId={editId}
          placeName={formData.name}
          onCancelEdit={cancelEdit}
          limitReached={limitReached}
          rejectionReason={rejectionReason}
        />

        {/* Form or Success View */}
        {success ? (
          <ProposePlaceSuccess
            isEditMode={Boolean(editId)}
            onProposeAnother={() => {
              resetForm();
              if (editId) router.push("/propose-place");
            }}
          />
        ) : (
          <ProposePlaceForm
            formRef={formRef}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            loading={loading}
            limitReached={limitReached}
            isEditMode={Boolean(editId)}
            errorMsg={errorMsg}
            newImgInput={newImgInput}
            setNewImgInput={setNewImgInput}
            isUploadingImg={isUploadingImg}
            onCategoryChange={handleCategoryChange}
            onAddImage={handleAddImage}
            onFileUpload={handleFileUpload}
            onRemoveImage={handleRemoveImage}
            onSubmit={handleSubmit}
          />
        )}

        {/* Previous Proposals History Section */}
        <ProposePlaceHistory
          historyRef={historyRef}
          proposals={userProposals}
          loading={proposalsLoading}
          editId={editId}
          onRefresh={fetchUserProposals}
          onSelectEdit={handleSelectEdit}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ProposePlacePage() {
  return (
    <Suspense fallback={<ProposePlaceLoading />}>
      <ProposePlaceContent />
    </Suspense>
  );
}

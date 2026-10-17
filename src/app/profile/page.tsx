"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useProfileData } from "./hooks/useProfileData";
import { useProfileWallet } from "./hooks/useProfileWallet";
import { useProfileSubscription } from "./hooks/useProfileSubscription";
import { useProfileSecurity } from "./hooks/useProfileSecurity";
import { useProfileFeedback } from "./hooks/useProfileFeedback";
import {
  ProfileHeaderGreeting,
  ProfileCard,
  ProfileBadges,
  ProfileActionsList,
  ProfileFooter,
  ProfileLoading,
  ProfileAlertModal,
  ProfilePointsModal,
  ProfileWalletModal,
  ProfileSubscriptionModal,
  ProfileSubscriptionConfirmModal,
  ProfilePasswordModal,
  ProfileTwoFactorModal,
  ProfileDevicesModal,
  ProfileFeedbackModals,
  ProfileRemindersModal,
  ProfileNotificationDetailsModal,
  ProfileAccountModals,
} from "./components";
import { getGreetingTitle } from "./utils";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { refreshProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteAll } = useNotifications();

  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  // 1. Core Profile Data Hook
  const {
    user,
    profile,
    setProfile,
    formData,
    setFormData,
    dbPlans,
    favorites,
    reminders,
    faqs,
    setFaqs,
    loading,
    authLoading,
    saving,
    editMode,
    setEditMode,
    uploadingAvatar,
    loadingReminders,
    isOwnProfile,
    greetingPrefix,
    theme,
    toggleTheme,
    message,
    setMessage,
    fetchProfileData,
    handleAvatarFileUpload,
    handleSaveProfile,
    handleDeleteReminder,
  } = useProfileData();

  // 2. Financial Wallet & Points Hook
  const wallet = useProfileWallet({
    user,
    profile,
    setProfile,
    refreshProfile,
  });

  // 3. Subscription & Plans Hook
  const subscription = useProfileSubscription({
    user,
    profile,
    dbPlans,
    fetchProfileData,
    refreshProfile,
  });

  // 4. Security, 2FA, Devices Hook
  const security = useProfileSecurity({
    user,
    profile,
    setMessage,
    setGlobalLoading,
  });

  // 5. Feedback, Requests, Reports, FAQs, Contact Hook
  const feedback = useProfileFeedback({
    user,
    profile,
    faqs,
    setFaqs,
    setMessage,
  });

  if (loading || authLoading || globalLoading) {
    return <ProfileLoading />;
  }

  const rawName =
    profile?.full_name ||
    formData.fullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    "";
  const greetingHeader = user ? getGreetingTitle(rawName, greetingPrefix) : greetingPrefix;

  const handleShowLimitMessage = () => {
    setMessage({
      type: "error",
      text: "لقد وصلت للحد الأقصى (5 طلبات معلقة). يرجى الانتظار حتى تقوم الإدارة بمراجعة طلباتك السابقة قبل تقديم اقتراحات أو بلاغات جديدة.",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenRemindersModal = () => {
    fetchProfileData();
    setIsRemindersModalOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* ─── Global Alert Message Modal ─── */}
      <ProfileAlertModal message={message} onClose={() => setMessage(null)} />

      {/* ─── Top Greeting Header ─── */}
      <ProfileHeaderGreeting greeting={greetingHeader} />

      {/* ─── Profile Rectangle Card ─── */}
      <ProfileCard
        user={user}
        profile={profile}
        formData={formData}
        setFormData={setFormData}
        isOwnProfile={isOwnProfile}
        editMode={editMode}
        setEditMode={setEditMode}
        saving={saving}
        uploadingAvatar={uploadingAvatar}
        handleAvatarFileUpload={handleAvatarFileUpload}
        handleSaveProfile={handleSaveProfile}
      />

      {/* ─── User Points and Balances Badges ─── */}
      {user && (
        <ProfileBadges
          profile={profile}
          isOwnProfile={isOwnProfile}
          onOpenPointsModal={() => {
            wallet.setShowPointsModal(true);
            wallet.setShowConvertSection(false);
          }}
          onOpenWalletModal={wallet.handleOpenWalletModal}
        />
      )}

      {/* ─── Main Actions & Navigation List ─── */}
      <ProfileActionsList
        user={user}
        profile={profile}
        isOwnProfile={isOwnProfile}
        theme={theme}
        toggleTheme={toggleTheme}
        favorites={favorites}
        reminders={reminders}
        hasRemindersAccess={subscription.hasRemindersAccess}
        profileExpired={subscription.profileExpired}
        notifications={notifications}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteAll={deleteAll}
        onSelectNotification={(notif) => setSelectedNotification(notif)}
        userProposals={feedback.userProposals}
        userReports={feedback.userReports}
        userAppFeedbacks={feedback.userAppFeedbacks}
        isLimitReached={feedback.isLimitReached}
        isRequestsExpanded={feedback.isRequestsExpanded}
        setIsRequestsExpanded={feedback.setIsRequestsExpanded}
        activeRequestsTab={feedback.activeRequestsTab}
        setActiveRequestsTab={feedback.setActiveRequestsTab}
        loadingRequests={feedback.loadingRequests}
        onRetractProposal={(id) => feedback.setProposalToRetract(id)}
        onRetractReport={(id) => feedback.setReportToRetract(id)}
        onDeleteFeedback={(fb) => feedback.setFeedbackToDelete(fb)}
        activeCount={security.activeCount}
        onOpenPasswordModal={() => security.setShowPasswordModal(true)}
        onOpen2FAModal={() => security.setShow2FAModal(true)}
        onOpenDevicesModal={() => {
          security.fetchDevices();
          security.setShowDevicesModal(true);
        }}
        onOpenSuggestionModal={() => feedback.setShowSuggestionModal(true)}
        onOpenBugReportModal={() => feedback.setShowBugReportModal(true)}
        isHelpExpanded={feedback.isHelpExpanded}
        setIsHelpExpanded={feedback.setIsHelpExpanded}
        helpTab={feedback.helpTab}
        setHelpTab={feedback.setHelpTab}
        faqs={feedback.faqs}
        expandedFaq={feedback.expandedFaq}
        setExpandedFaq={feedback.setExpandedFaq}
        faqQuestion={feedback.faqQuestion}
        setFaqQuestion={feedback.setFaqQuestion}
        faqAnswer={feedback.faqAnswer}
        setFaqAnswer={feedback.setFaqAnswer}
        faqLoading={feedback.faqLoading}
        handleAddFAQ={feedback.handleAddFAQ}
        handleDeleteFAQ={feedback.handleDeleteFAQ}
        contactForm={feedback.contactForm}
        setContactForm={feedback.setContactForm}
        contactSubmitted={feedback.contactSubmitted}
        setContactSubmitted={feedback.setContactSubmitted}
        contactLoading={feedback.contactLoading}
        handleContactSubmit={feedback.handleContactSubmit}
        onOpenSubModal={() => {
          subscription.setSubMessage(null);
          subscription.setShowSubModal(true);
        }}
        onOpenRemindersModal={handleOpenRemindersModal}
        onOpenLogoutModal={() => security.setShowLogoutModal(true)}
        onOpenDeleteModal={() => {
          security.setShowDeleteModal(true);
          security.setDeleteConfirmation("");
        }}
        onShowLimitMessage={handleShowLimitMessage}
      />

      {/* ─── Footer Card ─── */}
      <ProfileFooter />

      {/* ─── Modals ─── */}
      {/* 1. Points & Rewards Modal */}
      <ProfilePointsModal
        isOpen={wallet.showPointsModal}
        onClose={() => wallet.setShowPointsModal(false)}
        profile={profile}
        showConvertSection={wallet.showConvertSection}
        setShowConvertSection={wallet.setShowConvertSection}
        convertPointsAmount={wallet.convertPointsAmount}
        setConvertPointsAmount={wallet.setConvertPointsAmount}
        convertingPoints={wallet.convertingPoints}
        convertStatus={wallet.convertStatus}
        handleConvertPoints={wallet.handleConvertPoints}
      />

      {/* 2. Financial Wallet Modal */}
      <ProfileWalletModal
        isOpen={wallet.showWalletModal}
        onClose={() => wallet.setShowWalletModal(false)}
        profile={profile}
        walletTab={wallet.walletTab}
        setWalletTab={wallet.setWalletTab}
        depositMethod={wallet.depositMethod}
        setDepositMethod={wallet.setDepositMethod}
        depositAmount={wallet.depositAmount}
        setDepositAmount={wallet.setDepositAmount}
        depositSender={wallet.depositSender}
        setDepositSender={wallet.setDepositSender}
        depositImageFile={wallet.depositImageFile}
        depositImageUrl={wallet.depositImageUrl}
        isSubmittingDeposit={wallet.isSubmittingDeposit}
        depositStatus={wallet.depositStatus}
        handleDepositImageChange={wallet.handleDepositImageChange}
        handleDepositSubmit={wallet.handleDepositSubmit}
        withdrawMethod={wallet.withdrawMethod}
        setWithdrawMethod={wallet.setWithdrawMethod}
        withdrawAmount={wallet.withdrawAmount}
        setWithdrawAmount={wallet.setWithdrawAmount}
        withdrawRecipient={wallet.withdrawRecipient}
        setWithdrawRecipient={wallet.setWithdrawRecipient}
        withdrawName={wallet.withdrawName}
        setWithdrawName={wallet.setWithdrawName}
        isSubmittingWithdraw={wallet.isSubmittingWithdraw}
        withdrawStatus={wallet.withdrawStatus}
        handleWithdrawSubmit={wallet.handleWithdrawSubmit}
        userTransactions={wallet.userTransactions}
        loadingTransactions={wallet.loadingTransactions}
        pendingTransactionsCount={wallet.pendingTransactionsCount}
      />

      {/* 3. Subscription Modal */}
      <ProfileSubscriptionModal
        isOpen={subscription.showSubModal}
        onClose={() => subscription.setShowSubModal(false)}
        profile={profile}
        selectedPlanId={subscription.selectedPlanId}
        subscriptionPeriod={subscription.subscriptionPeriod}
        setSubscriptionPeriod={subscription.setSubscriptionPeriod}
        subscribing={subscription.subscribing}
        subMessage={subscription.subMessage}
        setSubMessage={subscription.setSubMessage}
        activeCardIndex={subscription.activeCardIndex}
        carouselRef={subscription.carouselRef}
        scrollToCard={subscription.scrollToCard}
        handleCarouselScroll={subscription.handleCarouselScroll}
        getPlanPrice={subscription.getPlanPrice}
        handleConfirmSubscribe={subscription.handleConfirmSubscribe}
        findPlan={subscription.findPlan}
      />

      {/* 4. Subscription Confirm Modal */}
      <ProfileSubscriptionConfirmModal
        isOpen={subscription.showSubConfirmModal}
        onClose={() => subscription.setShowSubConfirmModal(false)}
        confirmData={subscription.subConfirmData}
        onConfirm={subscription.executeSubscribe}
      />

      {/* 5. Password Modal */}
      <ProfilePasswordModal
        isOpen={security.showPasswordModal}
        onClose={() => {
          security.setShowPasswordModal(false);
          security.setPasswordForm({ new: "", confirm: "" });
        }}
        passwordForm={security.passwordForm}
        setPasswordForm={security.setPasswordForm}
        passwordLoading={security.passwordLoading}
        showPassword={security.showPassword}
        setShowPassword={security.setShowPassword}
        showConfirmPassword={security.showConfirmPassword}
        setShowConfirmPassword={security.setShowConfirmPassword}
        pwdRules={security.pwdRules}
        isPasswordValid={security.isPasswordValid}
        handleChangePassword={security.handleChangePassword}
      />

      {/* 6. 2FA Modal */}
      <ProfileTwoFactorModal
        isOpen={security.show2FAModal}
        onClose={() => security.setShow2FAModal(false)}
        activeMfaFactors={security.activeMfaFactors}
        mfaStep={security.mfaStep}
        setMfaStep={security.setMfaStep}
        mfaPasswordConfirm={security.mfaPasswordConfirm}
        setMfaPasswordConfirm={security.setMfaPasswordConfirm}
        qrCode={security.qrCode}
        mfaSecret={security.mfaSecret}
        codeDigits={security.codeDigits}
        inputRefs={security.inputRefs}
        mfaLoading={security.mfaLoading}
        mfaError={security.mfaError}
        setMfaError={security.setMfaError}
        verificationCode={security.verificationCode}
        setVerificationCode={security.setVerificationCode}
        showPassword={security.showPassword}
        setShowPassword={security.setShowPassword}
        handleDigitChange={security.handleDigitChange}
        handleKeyDown={security.handleKeyDown}
        handlePaste={security.handlePaste}
        handleEnrollTOTP={security.handleEnrollTOTP}
        handleVerifyTOTP={security.handleVerifyTOTP}
        handleUnenrollClick={security.handleUnenrollClick}
        handleUnenrollTOTP={security.handleUnenrollTOTP}
      />

      {/* 7. Devices Modal */}
      <ProfileDevicesModal
        isOpen={security.showDevicesModal}
        onClose={() => security.setShowDevicesModal(false)}
        devicesList={security.devicesList}
        loadingDevices={security.loadingDevices}
        deviceToDeactivate={security.deviceToDeactivate}
        setDeviceToDeactivate={security.setDeviceToDeactivate}
        handleDeactivateDevice={security.handleDeactivateDevice}
        executeDeactivateDevice={security.executeDeactivateDevice}
      />

      {/* 8. Feedback Modals (Suggestions, Bug Reports, Deletions, Retractions) */}
      <ProfileFeedbackModals
        showSuggestionModal={feedback.showSuggestionModal}
        setShowSuggestionModal={feedback.setShowSuggestionModal}
        suggestionType={feedback.suggestionType}
        setSuggestionType={feedback.setSuggestionType}
        suggestionMessage={feedback.suggestionMessage}
        setSuggestionMessage={feedback.setSuggestionMessage}
        suggestionLoading={feedback.suggestionLoading}
        isSuggestionFormValid={feedback.isSuggestionFormValid}
        handleSendSuggestion={feedback.handleSendSuggestion}
        showBugReportModal={feedback.showBugReportModal}
        setShowBugReportModal={feedback.setShowBugReportModal}
        bugType={feedback.bugType}
        setBugType={feedback.setBugType}
        bugDetails={feedback.bugDetails}
        setBugDetails={feedback.setBugDetails}
        bugImage={feedback.bugImage}
        setBugImage={feedback.setBugImage}
        setBugImageFile={feedback.setBugImageFile}
        bugLoading={feedback.bugLoading}
        bugUploading={feedback.bugUploading}
        isBugFormValid={feedback.isBugFormValid}
        handleBugImageChange={feedback.handleBugImageChange}
        handleSendBugReport={feedback.handleSendBugReport}
        feedbackToDelete={feedback.feedbackToDelete}
        setFeedbackToDelete={feedback.setFeedbackToDelete}
        handleDeleteFeedback={feedback.handleDeleteFeedback}
        proposalToRetract={feedback.proposalToRetract}
        setProposalToRetract={feedback.setProposalToRetract}
        handleRetractProposal={feedback.handleRetractProposal}
        reportToRetract={feedback.reportToRetract}
        setReportToRetract={feedback.setReportToRetract}
        handleRetractReport={feedback.handleRetractReport}
      />

      {/* 9. Reminders Modal */}
      <ProfileRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        user={user}
        hasRemindersAccess={subscription.hasRemindersAccess}
        reminders={reminders}
        loadingReminders={loadingReminders}
        onOpenSubModal={() => {
          subscription.setSubMessage(null);
          subscription.setShowSubModal(true);
        }}
        handleDeleteReminder={handleDeleteReminder}
      />

      {/* 10. Notification Details Modal */}
      <ProfileNotificationDetailsModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      {/* 11. Account Modals (Logout & Delete Account) */}
      <ProfileAccountModals
        showDeleteModal={security.showDeleteModal}
        setShowDeleteModal={security.setShowDeleteModal}
        deleteConfirmation={security.deleteConfirmation}
        setDeleteConfirmation={security.setDeleteConfirmation}
        deleteString={security.deleteString}
        loading={loading || globalLoading}
        handleDeleteAccount={security.handleDeleteAccount}
        showLogoutModal={security.showLogoutModal}
        setShowLogoutModal={security.setShowLogoutModal}
        handleLogout={security.handleLogout}
      />
    </div>
  );
}

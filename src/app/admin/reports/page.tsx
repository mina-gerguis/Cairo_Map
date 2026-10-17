"use client";

import React, { Suspense } from "react";
import styles from "./reports.module.css";
import { useIncomingReports } from "./hooks/useIncomingReports";
import {
  IncomingReportsHeader,
  IncomingReportsStats,
  IncomingReportsFilters,
  IncomingReportsCard,
  IncomingReportsToast,
  DirectoryProposalModal,
  ParkingProposalModal,
  DeleteReportModal,
  DeletePlaceDbModal,
  PreviewImageModal,
  IncomingReportsLoading,
} from "./components";

export default function AdminIncomingReportsPage() {
  return (
    <Suspense fallback={<IncomingReportsLoading />}>
      <IncomingReportsContent />
    </Suspense>
  );
}

function IncomingReportsContent() {
  const {
    authLoading,
    loading,
    isAdmin,
    filteredItems,
    stats,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    activeItemId,
    toggleItemExpansion,
    replyText,
    setReplyText,
    replyingId,
    updatingStatusId,
    toastMessage,
    showToast,
    handleRefresh,
    handleUpdateStatus,
    handleSendReply,
    itemToDelete,
    setItemToDelete,
    isDeleting,
    handleConfirmDelete,
    placeToDeleteFromDb,
    setPlaceToDeleteFromDb,
    isDeletingPlace,
    handleConfirmDeletePlaceFromDb,
    previewImageUrl,
    setPreviewImageUrl,
    dirModalItem,
    setDirModalItem,
    parkingModalItem,
    setParkingModalItem,
    setItems,
  } = useIncomingReports();

  if (authLoading || loading) {
    return <IncomingReportsLoading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.reportsContainer}>
      {/* Toast Alert */}
      <IncomingReportsToast toast={toastMessage} />

      {/* Header */}
      <IncomingReportsHeader loading={loading} onRefresh={handleRefresh} />

      {/* KPI Stats Overview */}
      <IncomingReportsStats stats={stats} />

      {/* Filters (Category Tabs, Search, Statuses) */}
      <IncomingReportsFilters
        stats={stats}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Reports List */}
      {filteredItems.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIcon}>📭</div>
          <h3 className={styles.emptyStateTitle}>
            لا توجد بلاغات أو اقتراحات تطابق خياراتك
          </h3>
          <p className={styles.emptyStateText}>جرب تغيير تبويب التصفية أو مسح عبارة البحث أعلاه.</p>
        </div>
      ) : (
        <div className={styles.reportsList}>
          {filteredItems.map((item) => (
            <IncomingReportsCard
              key={`${item.source}_${item.id}`}
              item={item}
              isOpen={activeItemId === item.id}
              onToggle={() => toggleItemExpansion(item.id)}
              replyText={replyText}
              setReplyText={setReplyText}
              replyingId={replyingId}
              updatingStatusId={updatingStatusId}
              onUpdateStatus={handleUpdateStatus}
              onSendReply={handleSendReply}
              onOpenAddToDirectory={(r) => setDirModalItem(r)}
              onOpenAddToParking={(r) => {
                const text = r.content || "";
                const getField = (prefix: string) => {
                  const line = text.split("\n").find((l: string) => l.includes(prefix));
                  if (!line) return "";
                  return line.replace(prefix, "").replace(/^[:\s]+/, "").trim();
                };

                const nameMatch =
                  r.title?.replace(/^اقتراح جراج جديد:\s*/, "")?.trim() ||
                  getField("اسم الجراج المقترح") ||
                  getField("اسم الجراج");
                const area = getField("المنطقة / الحي") || getField("المنطقة") || "وسط البلد";
                const address = getField("العنوان والمعالم") || getField("العنوان") || "";
                const nearestMetro = getField("أقرب محطة مترو") || getField("أقرب مترو") || "";
                const type = getField("نوع الجراج") || "مغطى ومتعدد الطوابق";
                const rateStr = getField("سعر الساعة التقديري") || getField("سعر الساعة");
                const hourlyRateNum = parseInt(rateStr.replace(/\D/g, ""), 10) || 10;
                const capStr = getField("السعة التقديرية") || getField("السعة");
                const capNum = parseInt(capStr.replace(/\D/g, ""), 10) || 100;
                const mapLink = getField("رابط خرائط جوجل") || getField("خرائط جوجل") || "";
                const featuresStr = getField("الميزات المتوفرة") || getField("الميزات") || "أمن وحراسة, كاميرات مراقبة";

                setParkingModalItem({
                  feedbackId: r.id,
                  feedbackUserId: r.user_id,
                  name: nameMatch || "جراج مقترح",
                  area,
                  address,
                  nearestMetro,
                  type: type.includes("ذكي")
                    ? "جراج ذكي إلكتروني"
                    : type.includes("سطحي")
                    ? "جراج سطحي مفتوح"
                    : "مغطى ومتعدد الطوابق",
                  hourlyRate: hourlyRateNum,
                  maxDailyRate: "",
                  capacity: capNum,
                  hours: "24 ساعة طوال الأسبوع",
                  features: featuresStr,
                  mapLocationLink: mapLink,
                });
              }}
              onOpenDeleteModal={(r) => setItemToDelete(r)}
              onOpenDeletePlaceDbModal={(data) => setPlaceToDeleteFromDb(data)}
              onPreviewImage={(url) => setPreviewImageUrl(url)}
            />
          ))}
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <DeleteReportModal
        item={itemToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />

      {/* Delete Place From Database Modal */}
      <DeletePlaceDbModal
        data={placeToDeleteFromDb}
        isDeleting={isDeletingPlace}
        onConfirm={handleConfirmDeletePlaceFromDb}
        onClose={() => setPlaceToDeleteFromDb(null)}
      />

      {/* Preview Image Modal */}
      <PreviewImageModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

      {/* Add to Directory Modal */}
      <DirectoryProposalModal
        item={dirModalItem}
        isAdmin={isAdmin}
        onClose={() => setDirModalItem(null)}
        onSuccess={(updatedItem, msg) => {
          setItems((prev) => prev.map((f) => (f.id === updatedItem.id ? updatedItem : f)));
          showToast("success", msg);
          setDirModalItem(null);
        }}
        onError={(msg) => showToast("error", msg)}
      />

      {/* Add to Parking Spots Modal */}
      <ParkingProposalModal
        data={parkingModalItem}
        isAdmin={isAdmin}
        onClose={() => setParkingModalItem(null)}
        onSuccess={(feedbackId, adminReplyText, toastText) => {
          setItems((prev) =>
            prev.map((f) =>
              f.id === feedbackId
                ? {
                    ...f,
                    status: "action_taken",
                    admin_reply: adminReplyText,
                  }
                : f
            )
          );
          showToast("success", toastText);
          setParkingModalItem(null);
        }}
        onError={(msg) => showToast("error", msg)}
      />
    </div>
  );
}

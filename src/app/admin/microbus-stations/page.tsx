"use client";

import React, { Suspense } from "react";
import styles from "../admin.module.css";
import { useAdminMicrobusStations } from "./hooks/useAdminMicrobusStations";
import {
  AdminMicrobusStationsHeader,
  AdminMicrobusStationsSqlBanner,
  AdminMicrobusStationsNotifications,
  AdminMicrobusStationsSearch,
  AdminMicrobusStationsTable,
  AdminMicrobusStationsModal,
  AdminMicrobusStationsDeleteModal,
  AdminMicrobusStationsLoading
} from "./components";

export default function AdminMicrobusStationsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--color-textSecondary)" }}>
          جاري التحميل...
        </div>
      }
    >
      <AdminMicrobusStationsContent />
    </Suspense>
  );
}

function AdminMicrobusStationsContent() {
  const {
    authLoading,
    loading,
    isAdmin,
    dbConnected,
    error,
    success,
    searchQuery,
    setSearchQuery,
    filteredStations,
    totalStationsCount,
    showModal,
    editingItem,
    formData,
    visualRoutes,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleFormFieldChange,
    handleRouteFieldChange,
    handleAddRoute,
    handleRemoveRoute,
    handleSubmit,
    itemToDelete,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete
  } = useAdminMicrobusStations();

  if (authLoading || loading) {
    return <AdminMicrobusStationsLoading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>
      {/* Upper Title Banner & Add Action */}
      <AdminMicrobusStationsHeader onAddClick={handleOpenAdd} />

      {/* SQL Warning Card if DB is using LocalStorage fallback */}
      {!dbConnected && <AdminMicrobusStationsSqlBanner />}

      {/* Notification Banner */}
      <AdminMicrobusStationsNotifications error={error} success={success} />

      {/* Search Input bar */}
      <AdminMicrobusStationsSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={totalStationsCount}
      />

      {/* Data Table */}
      <AdminMicrobusStationsTable
        stations={filteredStations}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
      />

      {/* Forms Modal */}
      <AdminMicrobusStationsModal
        isOpen={showModal}
        editingItem={editingItem}
        formData={formData}
        visualRoutes={visualRoutes}
        onClose={handleCloseModal}
        onFormFieldChange={handleFormFieldChange}
        onRouteFieldChange={handleRouteFieldChange}
        onAddRoute={handleAddRoute}
        onRemoveRoute={handleRemoveRoute}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <AdminMicrobusStationsDeleteModal
        itemToDelete={itemToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

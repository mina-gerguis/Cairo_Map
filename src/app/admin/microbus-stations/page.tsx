"use client";

import React, { Suspense } from "react";
import styles from "../admin.module.css";
import { useAdminMicrobusStations } from "./hooks/useAdminMicrobusStations";
import {
  AdminMicrobusStationsHeader,
  AdminMicrobusStationsSqlBanner,
  AdminMicrobusStationsNotifications,
  AdminMicrobusStationsSearch,
  AdminMicrobusStationsToolbar,
  AdminMicrobusStationsTable,
  AdminMicrobusStationsModal,
  AdminMicrobusStationsExcelModal,
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
    selectedStationKeys,
    selectedCount,
    toggleSelectStation,
    toggleSelectAll,
    clearSelection,
    showBulkDeleteModal,
    isBulkDeleting,
    handleOpenBulkDelete,
    handleCancelBulkDelete,
    handleConfirmBulkDelete,
    showExcelModal,
    handleOpenExcelModal,
    handleCloseExcelModal,
    handleExportExcel,
    handleImportExcel,
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
      {/* Upper Title Banner & Add/Export/Import Actions */}
      <AdminMicrobusStationsHeader
        onAddClick={handleOpenAdd}
        onOpenExcelModal={handleOpenExcelModal}
        onExportExcel={handleExportExcel}
      />

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

      {/* Selection & Bulk Actions Toolbar */}
      <AdminMicrobusStationsToolbar
        totalCount={totalStationsCount}
        visibleStations={filteredStations}
        selectedCount={selectedCount}
        selectedStationKeys={selectedStationKeys}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBulkDelete={handleOpenBulkDelete}
      />

      {/* Data Table */}
      <AdminMicrobusStationsTable
        stations={filteredStations}
        selectedStationKeys={selectedStationKeys}
        onToggleSelect={toggleSelectStation}
        onToggleSelectAll={toggleSelectAll}
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

      {/* Excel Import Modal */}
      <AdminMicrobusStationsExcelModal
        isOpen={showExcelModal}
        onClose={handleCloseExcelModal}
        onImportSuccess={handleImportExcel}
      />

      {/* Single Delete Confirmation Modal */}
      <AdminMicrobusStationsDeleteModal
        itemToDelete={itemToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Bulk Delete Confirmation Modal */}
      <AdminMicrobusStationsDeleteModal
        itemToDelete={null}
        bulkDeleteCount={showBulkDeleteModal ? selectedCount : 0}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onCancel={handleCancelBulkDelete}
      />
    </div>
  );
}

"use client";

import React, { Suspense } from "react";
import styles from "../admin.module.css";
import { useAdminBrtStations } from "./hooks/useAdminBrtStations";
import {
  AdminBrtStationsHeader,
  AdminBrtStationsSqlBanner,
  AdminBrtStationsNotifications,
  AdminBrtStationsSearch,
  AdminBrtStationsToolbar,
  AdminBrtStationsTable,
  AdminBrtStationsModal,
  AdminBrtStationsExcelModal,
  AdminBrtStationsDeleteModal,
  AdminBrtStationsLoading
} from "./components";

export default function AdminBrtStationsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--color-textSecondary)" }}>
          جاري التحميل...
        </div>
      }
    >
      <AdminBrtStationsContent />
    </Suspense>
  );
}

function AdminBrtStationsContent() {
  const {
    authLoading,
    loading,
    isAdmin,
    dbConnected,
    error,
    success,
    searchQuery,
    setSearchQuery,
    sectorFilter,
    setSectorFilter,
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
  } = useAdminBrtStations();

  if (authLoading || loading) {
    return <AdminBrtStationsLoading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>
      {/* Upper Title Banner & Add/Export/Import Actions */}
      <AdminBrtStationsHeader
        onAddClick={handleOpenAdd}
        onOpenExcelModal={handleOpenExcelModal}
        onExportExcel={handleExportExcel}
      />

      {/* SQL Warning Card if DB is using LocalStorage fallback */}
      {!dbConnected && <AdminBrtStationsSqlBanner />}

      {/* Notification Banner */}
      <AdminBrtStationsNotifications error={error} success={success} />

      {/* Search Input bar & Sector Filter */}
      <AdminBrtStationsSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sectorFilter={sectorFilter}
        onSectorFilterChange={setSectorFilter}
        totalCount={totalStationsCount}
      />

      {/* Selection & Bulk Actions Toolbar */}
      <AdminBrtStationsToolbar
        totalCount={totalStationsCount}
        visibleStations={filteredStations}
        selectedCount={selectedCount}
        selectedStationKeys={selectedStationKeys}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBulkDelete={handleOpenBulkDelete}
      />

      {/* Data Table */}
      <AdminBrtStationsTable
        stations={filteredStations}
        selectedStationKeys={selectedStationKeys}
        onToggleSelect={toggleSelectStation}
        onToggleSelectAll={toggleSelectAll}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
      />

      {/* Forms Modal */}
      <AdminBrtStationsModal
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
      <AdminBrtStationsExcelModal
        isOpen={showExcelModal}
        onClose={handleCloseExcelModal}
        onImportSuccess={handleImportExcel}
      />

      {/* Single Delete Confirmation Modal */}
      <AdminBrtStationsDeleteModal
        itemToDelete={itemToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Bulk Delete Confirmation Modal */}
      <AdminBrtStationsDeleteModal
        itemToDelete={null}
        bulkDeleteCount={showBulkDeleteModal ? selectedCount : 0}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onCancel={handleCancelBulkDelete}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import styles from "./directions.module.css";
import { useAdminDirections } from "./hooks/useAdminDirections";
import CustomModal from "@/components/common/Modals";
import {
  AdminDirectionsHeader,
  AdminDirectionsSqlBanner,
  AdminDirectionsNotifications,
  AdminDirectionsForm,
  AdminDirectionsFilters,
  AdminDirectionsOriginTabs,
  AdminDirectionsToolbar,
  AdminDirectionsList,
  AdminDirectionsLoading,
  AdminDirectionsUnauthorized,
  AdminDirectionsExcelModal,
  AdminTransitTypesCheatsheet
} from "./components";

export default function AdminDirectionsPage(props: any) {
  const isSubComponent = props?.isSubComponent ?? false;
  const [showCheatsheetModal, setShowCheatsheetModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<{ from: string; to: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    authLoading,
    loading,
    isAdmin,
    dbMissing,
    error,
    success,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    selectedOrigin,
    setSelectedOrigin,
    uniqueOrigins,
    groupedRoutesCount,
    filteredGroupedRoutes,
    expandedRouteKeys,
    toggleRouteExpand,
    expandAllRoutes,
    collapseAllRoutes,
    selectedRouteKeys,
    selectedCount,
    toggleSelectRoute,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
    showAddForm,
    showExcelModal,
    setShowExcelModal,
    editingConnection,
    openAddForm,
    closeForm,
    fromLocation,
    setFromLocation,
    toLocation,
    setToLocation,
    fromAliases,
    setFromAliases,
    toAliases,
    setToAliases,
    options,
    setOptions,
    isSubmitting,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleExcelImport,
    handleExcelExport
  } = useAdminDirections({ isSubComponent });

  // 1. Loading State
  if (!isSubComponent && (loading || authLoading)) {
    return <AdminDirectionsLoading />;
  }

  // 2. Unauthorized State
  if (!isSubComponent && !isAdmin) {
    return <AdminDirectionsUnauthorized />;
  }

  const handleDeleteClick = (from: string, to: string) => {
    setRouteToDelete({ from, to });
  };

  const confirmDelete = async () => {
    if (!routeToDelete) return;
    setIsDeleting(true);
    try {
      await handleDelete(routeToDelete.from, routeToDelete.to);
    } finally {
      setIsDeleting(false);
      setRouteToDelete(null);
    }
  };

  // 3. Main Admin Workspace View
  return (
    <div className={styles.directionsContainer}>
      {/* Page Header */}
      <AdminDirectionsHeader
        showAddForm={showAddForm}
        onToggleForm={() => {
          if (showAddForm) {
            closeForm();
          } else {
            openAddForm();
          }
        }}
        onOpenExcelModal={() => setShowExcelModal(true)}
        onExportExcel={handleExcelExport}
        onOpenCheatsheet={() => setShowCheatsheetModal(true)}
      />

      {/* SQL Setup Banner (if DB or legs column missing) */}
      {dbMissing && <AdminDirectionsSqlBanner />}

      {/* Notifications (Error / Success) */}
      <AdminDirectionsNotifications error={error} success={success} />

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <AdminDirectionsForm
          editingConnection={editingConnection}
          fromLocation={fromLocation}
          onFromLocationChange={setFromLocation}
          toLocation={toLocation}
          onToLocationChange={setToLocation}
          fromAliases={fromAliases}
          onFromAliasesChange={setFromAliases}
          toAliases={toAliases}
          onToAliasesChange={setToAliases}
          options={options}
          onOptionsChange={setOptions}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {/* Search & Vehicle Filter */}
      <AdminDirectionsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
      />

      {/* Origin Locations Dynamic Tabs */}
      <AdminDirectionsOriginTabs
        selectedOrigin={selectedOrigin}
        onSelectOrigin={setSelectedOrigin}
        totalRoutesCount={groupedRoutesCount}
        uniqueOrigins={uniqueOrigins}
      />

      {/* List Toolbar (Totals, Selection, Bulk Delete, and Expand/Collapse All) */}
      <AdminDirectionsToolbar
        totalCount={filteredGroupedRoutes.length}
        visibleRoutes={filteredGroupedRoutes}
        selectedCount={selectedCount}
        selectedRouteKeys={selectedRouteKeys}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onExpandAll={expandAllRoutes}
        onCollapseAll={collapseAllRoutes}
      />

      {/* Routes Collapsible Accordion List */}
      <AdminDirectionsList
        routes={filteredGroupedRoutes}
        expandedRouteKeys={expandedRouteKeys}
        selectedRouteKeys={selectedRouteKeys}
        onToggleExpand={toggleRouteExpand}
        onToggleSelect={toggleSelectRoute}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Excel Sheet Import Modal */}
      <AdminDirectionsExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onImportSuccess={handleExcelImport}
      />

      {/* Standalone Transit Types Cheatsheet Modal */}
      {showCheatsheetModal && (
        <AdminTransitTypesCheatsheet
          isModal={true}
          onClose={() => setShowCheatsheetModal(false)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(routeToDelete)}
        onClose={() => !isDeleting && setRouteToDelete(null)}
        title="تأكيد الحذف"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message="هل أنت متأكد من حذف هذا المسار بجميع وسائل المواصلات الخاصة به؟"
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDelete,
          bgColor: "#ff3b30",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setRouteToDelete(null),
          bgColor: "var(--btn-cancel)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        {routeToDelete && (
          <p style={{ margin: "0", color: "#ff4d4d", fontSize: "1.05rem", fontWeight: "bold", textAlign: "center" }}>
            « من {routeToDelete.from} إلى {routeToDelete.to} »
          </p>
        )}
      </CustomModal>
    </div>
  );
}

"use client";

import React from "react";
import styles from "./directions.module.css";
import { useAdminDirections } from "./hooks/useAdminDirections";
import {
  AdminDirectionsHeader,
  AdminDirectionsStats,
  AdminDirectionsSqlBanner,
  AdminDirectionsNotifications,
  AdminDirectionsForm,
  AdminDirectionsFilters,
  AdminDirectionsOriginTabs,
  AdminDirectionsToolbar,
  AdminDirectionsList,
  AdminDirectionsLoading,
  AdminDirectionsUnauthorized,
  AdminDirectionsExcelModal
} from "./components";

export default function AdminDirectionsPage(props: any) {
  const isSubComponent = props?.isSubComponent ?? false;
  const {
    authLoading,
    loading,
    isAdmin,
    dbMissing,
    error,
    success,
    stats,
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
      />

      {/* Real-time Statistics Summary */}
      <AdminDirectionsStats
        totalConnectionsCount={stats.totalConnectionsCount}
        totalOptionsCount={stats.totalOptionsCount}
        totalMultiLegCount={stats.totalMultiLegCount}
      />

      {/* SQL Setup Banner (if DB or legs column missing) */}
      {dbMissing && <AdminDirectionsSqlBanner />}

      {/* Notifications (Error / Success) */}
      <AdminDirectionsNotifications error={error} success={success} />

      {/* Add / Edit Form Modal / Drawer */}
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
        onDelete={handleDelete}
      />

      {/* Excel Sheet Import Modal */}
      <AdminDirectionsExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onImportSuccess={handleExcelImport}
      />
    </div>
  );
}

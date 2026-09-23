"use client";

import React from "react";
import LandmarkDetailModal from "@/components/cities/LandmarkDetailModal";
import RequireAuthModal from "@/components/common/RequireAuthModal";
import { useFavorites } from "./hooks";
import {
  FavoritesHeader,
  FavoritesLockState,
  FavoritesEmpty,
  FavoritesTabs,
  FavoritesList,
  FavoritesLoading,
} from "./components";
import { ROUTES } from "./constants";
import styles from "./favorites.module.css";

export default function FavoritesPage() {
  const {
    user,
    authLoading,
    loading,
    favorites,
    filteredFavorites,
    categories,
    selectedCategory,
    setSelectedCategory,
    showAuthModal,
    setShowAuthModal,
    activeLandmarkModal,
    setActiveLandmarkModal,
    handleRemoveFavorite,
    handleItemClick,
    getCategoryCount,
    router,
  } = useFavorites();

  if (loading || authLoading) {
    return <FavoritesLoading />;
  }

  return (
    <div className={styles.container}>
      {/* Sticky Header */}
      <FavoritesHeader onBack={() => router.back()} />

      <main className={styles.content}>
        {!user ? (
          <FavoritesLockState onLogin={() => router.push(ROUTES.LOGIN)} />
        ) : favorites.length === 0 ? (
          <FavoritesEmpty />
        ) : (
          <>
            {/* Categories Tabs Filter */}
            <FavoritesTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalCount={favorites.length}
              getCategoryCount={getCategoryCount}
            />

            {/* Favorite Items List */}
            <FavoritesList
              items={filteredFavorites}
              onRemove={handleRemoveFavorite}
              onItemClick={handleItemClick}
            />
          </>
        )}
      </main>

      {/* Landmark Details Modal */}
      {activeLandmarkModal && (
        <LandmarkDetailModal
          landmark={activeLandmarkModal.landmark}
          city={activeLandmarkModal.city}
          allCityLandmarks={activeLandmarkModal.city.landmarks || []}
          onClose={() => setActiveLandmarkModal(null)}
          onSelectLandmark={(newLm) =>
            setActiveLandmarkModal({
              landmark: newLm,
              city: activeLandmarkModal.city,
            })
          }
        />
      )}

      {/* Authentication Prompt Modal */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

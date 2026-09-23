import React from "react";
import { FavoritesListProps } from "../types";
import FavoriteCard from "./FavoriteCard";
import styles from "../favorites.module.css";

export default function FavoritesList({
  items,
  onRemove,
  onItemClick,
}: FavoritesListProps) {
  return (
    <div className={styles.placesGrid}>
      {items.map((item) => (
        <FavoriteCard
          key={item.id}
          item={item}
          onRemove={onRemove}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}

"use client";

import React from "react";
import styles from "../page.module.css";

interface ProfileHeaderGreetingProps {
  greeting: string;
}

export const ProfileHeaderGreeting: React.FC<ProfileHeaderGreetingProps> = ({ greeting }) => {
  return (
    <div className={styles.topGreetingHeader}>
      <h1 className={styles.topGreetingTitle}>{greeting}</h1>
    </div>
  );
};

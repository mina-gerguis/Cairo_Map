import React from "react";
import DriftWall from "@/components/ui/ElasticMesh";
import { DRIFT_WALL_ITEMS } from "../constants";
import { LoginLayoutProps } from "../types";
import styles from "../login.module.css";

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div className={styles.loginLayout}>
      {/* Background Interactive Mesh Layer */}
      <div className={styles.driftWallWrapper}>
        <DriftWall
          items={DRIFT_WALL_ITEMS}
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
          radius={14}
          roll={0}
          pauseOnHover={false}
          grayscale={false}
        />
      </div>

      {/* Ambient Radial Glow Orbs */}
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />

      {/* Center Form Container */}
      <div className={styles.formContainer}>
        {children}
      </div>
    </div>
  );
};

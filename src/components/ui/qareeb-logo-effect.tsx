"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

const OUTER_PATH = `M 1396 248.672 C 1377.416 251.640, 1360.764 256.865, 1347.302 263.952 C 1333.099 271.429, 1324.129 279.526, 1317.126 291.191 C 1315.907 293.221, 1308.672 312.571, 1301.047 334.191 C 1273.975 410.949, 1268.697 425.949, 1255.012 465 C 1247.398 486.725, 1235.911 519.350, 1229.484 537.500 C 1223.056 555.650, 1216.933 573.162, 1215.875 576.415 C 1208.770 598.275, 1209.473 632.092, 1217.587 658.691 C 1220.877 669.478, 1228.515 684.617, 1234.964 693.135 C 1241.492 701.758, 1255.769 715.239, 1264 720.553 C 1302.834 745.625, 1353.440 753.229, 1405.869 741.869 C 1418.922 739.041, 1433.272 733.943, 1447.787 726.976 C 1467.893 717.325, 1482.057 707.219, 1499.238 690.266 C 1504.044 685.523, 1508.157 681.836, 1508.378 682.072 C 1510.066 683.875, 1525.065 707.948, 1530.999 718.378 C 1543.877 741.012, 1560.265 782.236, 1567.421 810 C 1587.739 888.832, 1587.880 971.383, 1567.864 1070 C 1557.184 1122.623, 1542.471 1170.813, 1519.872 1227.202 C 1489.474 1303.048, 1447.123 1376.389, 1399.371 1435.881 C 1362.211 1482.176, 1319.619 1525.055, 1278 1558.070 C 1246.468 1583.083, 1229.289 1594.697, 1184.500 1621.282 C 1163.241 1633.900, 1119.589 1654.118, 1089.163 1665.439 C 1059.926 1676.318, 1022.397 1687.157, 995.500 1692.491 C 979.491 1695.666, 936.373 1701.521, 917.500 1703.082 C 898.865 1704.624, 841.391 1704.646, 822 1703.118 C 804.542 1701.742, 772.474 1697.355, 751.500 1693.473 C 693.864 1682.804, 642.441 1662.303, 596.116 1631.523 C 577.466 1619.131, 564.387 1608.160, 546.460 1589.867 C 519.497 1562.354, 496.777 1529.977, 480.950 1496.512 C 463.818 1460.287, 453.745 1424.313, 447.486 1377 C 441.950 1335.160, 441.543 1272.553, 446.486 1223.500 C 453.280 1156.084, 468.056 1085.406, 493.106 1000.500 C 508.442 948.522, 548.254 831.534, 582.416 738.069 C 589.337 719.132, 595 703.325, 595 702.942 C 595 702.560, 591.512 701.340, 587.250 700.231 C 582.987 699.122, 568.479 695.235, 555.009 691.593 C 541.539 687.951, 530.015 685.164, 529.401 685.400 C 528.787 685.635, 527.992 687.292, 527.634 689.080 C 527.276 690.869, 522.753 702.495, 517.582 714.916 C 507.448 739.258, 496.461 767.124, 478.316 814.500 C 447.436 895.131, 413.657 994.034, 396.893 1052.904 C 365.165 1164.318, 349.139 1239.837, 337.559 1332.500 C 328.332 1406.334, 326.596 1480.303, 332.549 1546 C 339.393 1621.529, 357.419 1694.479, 384.441 1756 C 400.941 1793.566, 416.911 1820.717, 442.178 1854.158 C 467.797 1888.065, 498.290 1916.720, 533 1939.507 C 557.689 1955.715, 578.563 1966.534, 604.529 1976.580 C 645.332 1992.366, 682.686 2000.621, 738.500 2006.187 C 756.023 2007.934, 822.872 2007.934, 841.500 2006.187 C 898.959 2000.796, 937.091 1992.721, 988 1975.161 C 1023.755 1962.828, 1066.754 1942.745, 1106 1920.049 C 1144.876 1897.567, 1196.236 1859.837, 1238.061 1823.035 C 1256.145 1807.123, 1297.423 1766.338, 1314.564 1747.447 C 1349.965 1708.429, 1384.381 1666.350, 1410.621 1630 C 1456.379 1566.611, 1488.732 1513.484, 1522.974 1445.500 C 1555.858 1380.214, 1578.829 1325.007, 1601.198 1257.500 C 1619.153 1203.313, 1632.634 1152.804, 1643.503 1099 C 1665.252 991.335, 1675.390 882.213, 1673.652 774.500 C 1672.533 705.104, 1668.392 651.582, 1659.417 590.500 C 1653.497 550.205, 1642.821 498.478, 1633.515 465 C 1629.255 449.673, 1616.832 414.107, 1610.496 399.096 C 1584.839 338.311, 1548.002 293.800, 1503 269.204 C 1487.431 260.694, 1463.334 252.685, 1443.747 249.508 C 1435.210 248.123, 1402.969 247.559, 1396 248.672`;
const INNER_PATH = `M 1387 456.091 C 1380.195 457.411, 1369.180 463.274, 1362.808 468.969 C 1351.460 479.112, 1343.047 495.544, 1342.218 509.185 C 1341.794 516.162, 1342.025 517.451, 1344.735 523.185 C 1349.611 533.503, 1357.906 540.510, 1372.697 546.803 C 1395.792 556.631, 1431.740 561.128, 1462 557.976 C 1473.204 556.809, 1488.065 554.196, 1489.880 553.074 C 1490.847 552.476, 1489.889 549.742, 1485.961 541.891 C 1465.137 500.269, 1441.078 471.521, 1417.860 460.518 C 1406.895 455.322, 1397.742 454.009, 1387 456.091`;
const COMBINED_PATH = `${OUTER_PATH} ${INNER_PATH}`;

interface QareebLogoEffectProps {
  className?: string;
  speed?: number;
  onAnimationComplete?: () => void;
}

export const QareebLogoEffect: React.FC<QareebLogoEffectProps> = ({
  className = "",
  speed = 1,
  onAnimationComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState<"drawing" | "filled">("drawing");
  const calc = (x: number) => x * speed;

  return (
    <div className={`relative w-full max-w-[340px] flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background ambient neon aura */}
      <motion.div
        className="absolute w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.22) 0%, rgba(37, 99, 235, 0.1) 45%, transparent 75%)",
        }}
        animate={{
          scale: animationPhase === "filled" ? [1, 1.15, 1] : 1,
          opacity: animationPhase === "filled" ? [0.6, 0.9, 0.7] : 0.4,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* SVG Canvas for Drawing the Logo */}
      <div className="relative w-[180px] h-[190px] flex items-center justify-center">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="280 200 1440 1840"
          className="w-full h-full overflow-visible drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          initial={{ opacity: 1 }}
        >
          <defs>
            {/* Linear gradient for stroke drawing */}
            <linearGradient id="qareebStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#93c5fd" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>

            {/* Linear gradient for inner fill */}
            <linearGradient id="qareebFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f0f6ff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="qareebGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Animated Stroke: Outer Calligraphy Contour */}
          <motion.path
            d={OUTER_PATH}
            fill="none"
            stroke="url(#qareebStrokeGrad)"
            strokeWidth={32}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#qareebGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: calc(2.4),
              ease: "easeInOut",
              opacity: { duration: 0.3 },
            }}
          />

          {/* 2. Animated Stroke: Inner Loop Eye */}
          <motion.path
            d={INNER_PATH}
            fill="none"
            stroke="url(#qareebStrokeGrad)"
            strokeWidth={28}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: calc(1.4),
              delay: calc(0.9),
              ease: "easeInOut",
              opacity: { duration: 0.3, delay: calc(0.9) },
            }}
          />

          {/* 3. Smooth Fill Reveal (Fades in once strokes are fully drawn) */}
          <motion.path
            d={COMBINED_PATH}
            fill="url(#qareebFillGrad)"
            fillRule="evenodd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: calc(2.4),
              duration: calc(0.9),
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              setAnimationPhase("filled");
              if (onAnimationComplete) onAnimationComplete();
            }}
          />
        </motion.svg>
      </div>
    </div>
  );
};

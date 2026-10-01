"use client";

import React from "react";
import { ParkingGarageListProps } from "../types";
import { ParkingResultsSection } from "./ParkingResultsSection";

export function ParkingGarageList(props: ParkingGarageListProps) {
  return <ParkingResultsSection {...props} />;
}

export default ParkingGarageList;

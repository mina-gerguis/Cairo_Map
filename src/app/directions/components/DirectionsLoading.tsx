import React from "react";

export default function DirectionsLoading() {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-center items-center pb-16">
      <div className="w-11 h-11 border-3 border-glass border-t-secondary rounded-full animate-spin mb-5" />
      <p className="text-secondary text-base font-sub m-0">
        جاري تحميل دليل المسارات ...
      </p>
    </div>
  );
}

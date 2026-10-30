"use client";

import { Demo } from "@/components/ui/demo";

export default function DemoPage() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="p-4 text-center border-b border-border">
        <h1 className="text-xl font-bold">معاينة شريط التنقل المنسدل (Dropdown Navigation Demo)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          المكون التفاعلي المتحرك مع Framer Motion و Lucide Icons
        </p>
      </div>
      <Demo />
    </div>
  );
}

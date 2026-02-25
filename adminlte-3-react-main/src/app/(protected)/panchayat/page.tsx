"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

import { RouteGuard } from "@app/components/RouteGuard";

const Panchayat = dynamic(() => import("@app/views/Panchayat"), {
  ssr: false,
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[401px] w-full" />
    </div>
  ),
});

export default function PanchayatPage() {
  return (
    <RouteGuard requiredPermission="view_panchayats">
      <Panchayat />
    </RouteGuard>
  );
}

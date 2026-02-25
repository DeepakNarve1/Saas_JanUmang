"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";

const PermissionsView = dynamic(() => import("@app/views/permissions/index"), {
  ssr: false,
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

export default function PermissionsPage() {
  return <PermissionsView />;
}

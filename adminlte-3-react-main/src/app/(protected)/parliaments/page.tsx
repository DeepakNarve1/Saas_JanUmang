"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";

const Parliament = dynamic(() => import("@app/views/parliament"), {
  ssr: false,
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[401px] w-full" />
    </div>
  ),
});

export default function ParliamentsPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_PARLIAMENTS]}>
      <Parliament />
    </RouteGuard>
  );
}

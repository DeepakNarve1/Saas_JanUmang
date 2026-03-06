"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

const Users = dynamic(() => import("@app/views/users"), {
  ssr: false,
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

export default function UsersPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_USERS]}>
      <Users />
    </RouteGuard>
  );
}

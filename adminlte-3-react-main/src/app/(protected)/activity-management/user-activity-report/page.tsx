"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";
import { RouteGuard } from "@app/components/RouteGuard";

const UserActivityReport = dynamic(
  () => import("@app/views/activityManagement/userActivityReport"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[401px] w-full" />
      </div>
    ),
  }
);

export default function UserActivityReportPage() {
  return (
    <RouteGuard requiredPermission="view_user_activity_report">
      <UserActivityReport />
    </RouteGuard>
  );
}

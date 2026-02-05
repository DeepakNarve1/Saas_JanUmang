"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@app/components/ui/skeleton";
import { RouteGuard } from "@app/components/RouteGuard";

const ActivityLogView = dynamic(
  () => import("@app/views/activityManagement/activityLogs/ActivityLogView"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    ),
  },
);

export default function ActivityLogViewPage() {
  return (
    <RouteGuard requiredPermission="view_activity_logs">
      <ActivityLogView />
    </RouteGuard>
  );
}

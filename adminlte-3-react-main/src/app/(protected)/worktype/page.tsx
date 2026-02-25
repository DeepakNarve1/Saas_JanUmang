"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import WorktypeList from "@app/views/worktype";

export default function WorktypePage() {
  return (
    <RouteGuard requiredPermission="view_work_types">
      <WorktypeList />
    </RouteGuard>
  );
}

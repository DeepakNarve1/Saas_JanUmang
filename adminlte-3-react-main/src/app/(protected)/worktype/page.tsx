"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import WorktypeList from "@app/views/worktype";

export default function WorktypePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_WORK_TYPES]}>
      <WorktypeList />
    </RouteGuard>
  );
}

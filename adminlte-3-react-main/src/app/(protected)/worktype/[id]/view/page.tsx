"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewWorktype from "@app/views/worktype/ViewWorktype";

export default function ViewWorktypePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_WORK_TYPES]}>
      <ViewWorktype />
    </RouteGuard>
  );
}

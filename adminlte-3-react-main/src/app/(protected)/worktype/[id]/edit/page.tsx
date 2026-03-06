"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditWorktype from "@app/views/worktype/EditWorktype";

export default function EditWorktypePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_WORK_TYPES]}>
      <EditWorktype />
    </RouteGuard>
  );
}

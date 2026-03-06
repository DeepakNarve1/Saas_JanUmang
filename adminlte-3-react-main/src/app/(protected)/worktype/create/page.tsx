"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateWorktype from "@app/views/worktype/CreateWorktype";

export default function CreateWorktypePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_WORK_TYPES]}>
      <CreateWorktype />
    </RouteGuard>
  );
}

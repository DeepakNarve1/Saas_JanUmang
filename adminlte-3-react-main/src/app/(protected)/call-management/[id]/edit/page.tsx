"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditCall from "@app/views/callManagement/EditCall";

export default function EditCallPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_CALL_MANAGEMENT]}>
      <EditCall />
    </RouteGuard>
  );
}

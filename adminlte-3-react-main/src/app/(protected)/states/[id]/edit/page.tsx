"use client";

import EditState from "@app/views/state/EditState";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditStatePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_STATES]}>
      <EditState />
    </RouteGuard>
  );
}

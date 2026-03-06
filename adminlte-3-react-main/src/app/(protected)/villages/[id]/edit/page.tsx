"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditVillage from "@app/views/village/EditVillage";

export default function EditVillagePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_VILLAGES]}>
      <EditVillage />
    </RouteGuard>
  );
}

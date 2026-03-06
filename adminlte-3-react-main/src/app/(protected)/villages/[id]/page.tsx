"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewVillage from "@app/views/village/ViewVillage";

export default function ViewVillagePage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_VILLAGES]}>
      <ViewVillage />
    </RouteGuard>
  );
}

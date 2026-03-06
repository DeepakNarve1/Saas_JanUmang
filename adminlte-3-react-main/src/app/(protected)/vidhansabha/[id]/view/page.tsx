"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewVidhanSabha from "@app/views/vidhanSabha/ViewVidhanSabha";

export default function ViewVidhanSabhaPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_ASSEMBLIES]}>
      <ViewVidhanSabha />
    </RouteGuard>
  );
}

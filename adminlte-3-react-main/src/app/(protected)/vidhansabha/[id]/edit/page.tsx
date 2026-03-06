"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditVidhanSabha from "@app/views/vidhanSabha/EditVidhanSabha";

export default function EditVidhanSabhaPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_ASSEMBLIES]}>
      <EditVidhanSabha />
    </RouteGuard>
  );
}

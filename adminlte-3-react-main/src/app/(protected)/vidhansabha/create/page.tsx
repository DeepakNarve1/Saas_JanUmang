"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateVidhanSabha from "@app/views/vidhanSabha/CreateVidhanSabha";

export default function CreateVidhanSabhaPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_ASSEMBLIES]}>
      <CreateVidhanSabha />
    </RouteGuard>
  );
}

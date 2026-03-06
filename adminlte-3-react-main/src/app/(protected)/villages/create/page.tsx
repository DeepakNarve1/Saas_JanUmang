"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateVillage from "@app/views/village/CreateVillage";

export default function CreateUserPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_VILLAGES]}>
      <CreateVillage />
    </RouteGuard>
  );
}

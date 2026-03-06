"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditInwardRegister from "@app/views/inwardRegister/EditInwardRegister";

export default function EditInwardRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_INWARD_REGISTER]}>
      <EditInwardRegister />
    </RouteGuard>
  );
}

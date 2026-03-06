"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateInwardRegister from "@app/views/inwardRegister/CreateInwardRegister";

export default function CreateInwardRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_INWARD_REGISTER]}>
      <CreateInwardRegister />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import InwardRegisterList from "@app/views/inwardRegister";

export default function InwardRegisterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_INWARD_REGISTER]}>
      <InwardRegisterList />
    </RouteGuard>
  );
}

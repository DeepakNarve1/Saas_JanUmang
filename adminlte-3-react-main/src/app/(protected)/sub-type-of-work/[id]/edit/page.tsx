"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditSubTypeOfWork from "@app/views/subtypeOfWork/EditSubTypeOfWork";

export default function EditSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_SUB_WORK_TYPES]}>
      <EditSubTypeOfWork />
    </RouteGuard>
  );
}

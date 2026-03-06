"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewSubTypeOfWork from "@app/views/subtypeOfWork/ViewSubTypeOfWork";

export default function ViewSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_SUB_WORK_TYPES]}>
      <ViewSubTypeOfWork />
    </RouteGuard>
  );
}

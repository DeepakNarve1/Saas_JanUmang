"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import SubTypeOfWorkList from "@app/views/subtypeOfWork";

export default function SubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_SUB_WORK_TYPES]}>
      <SubTypeOfWorkList />
    </RouteGuard>
  );
}

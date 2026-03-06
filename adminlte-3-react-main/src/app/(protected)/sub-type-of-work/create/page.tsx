"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateSubTypeOfWork from "@app/views/subtypeOfWork/CreateSubTypeOfWork";

export default function CreateSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_SUB_WORK_TYPES]}>
      <CreateSubTypeOfWork />
    </RouteGuard>
  );
}

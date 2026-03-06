"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import DepartmentList from "@app/views/department";

export default function DepartmentPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_DEPARTMENTS]}>
      <DepartmentList />
    </RouteGuard>
  );
}

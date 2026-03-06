"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewDepartment from "@app/views/department/ViewDepartment";

export default function ViewDepartmentPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_DEPARTMENTS]}>
      <ViewDepartment />
    </RouteGuard>
  );
}

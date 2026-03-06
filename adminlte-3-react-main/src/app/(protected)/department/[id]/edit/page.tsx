"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditDepartment from "@app/views/department/EditDepartment";

export default function EditDepartmentPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_DEPARTMENTS]}>
      <EditDepartment />
    </RouteGuard>
  );
}

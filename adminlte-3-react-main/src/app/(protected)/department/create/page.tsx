"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateDepartment from "@app/views/department/CreateDepartment";

export default function CreateDepartmentPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_DEPARTMENTS]}>
      <CreateDepartment />
    </RouteGuard>
  );
}

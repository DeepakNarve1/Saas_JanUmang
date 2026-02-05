"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditDepartment from "@app/views/department/EditDepartment";

export default function EditDepartmentPage() {
  return (
    <RouteGuard requiredPermission="edit_department">
      <EditDepartment />
    </RouteGuard>
  );
}

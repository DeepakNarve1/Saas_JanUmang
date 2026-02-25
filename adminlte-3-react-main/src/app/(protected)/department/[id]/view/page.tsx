"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewDepartment from "@app/views/department/ViewDepartment";

export default function ViewDepartmentPage() {
  return (
    <RouteGuard requiredPermission="view_departments">
      <ViewDepartment />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateDepartment from "@app/views/department/CreateDepartment";

export default function CreateDepartmentPage() {
  return (
    <RouteGuard requiredPermission="create_departments">
      <CreateDepartment />
    </RouteGuard>
  );
}

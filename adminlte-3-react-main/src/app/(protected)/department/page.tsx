"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import DepartmentList from "@app/views/department";

export default function DepartmentPage() {
  return (
    <RouteGuard requiredPermission="view_department">
      <DepartmentList />
    </RouteGuard>
  );
}

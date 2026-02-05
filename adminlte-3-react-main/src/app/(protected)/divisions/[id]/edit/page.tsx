"use client";

import EditDivision from "@app/views/division/EditDivision";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditDivisionPage() {
  return (
    <RouteGuard requiredPermission="edit_divisions">
      <EditDivision />
    </RouteGuard>
  );
}

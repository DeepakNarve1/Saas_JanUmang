"use client";

import EditDivision from "@app/views/division/EditDivision";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditDivisionPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_DIVISIONS]}>
      <EditDivision />
    </RouteGuard>
  );
}

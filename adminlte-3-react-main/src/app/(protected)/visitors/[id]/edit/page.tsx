"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditVisitor from "@app/views/visitors/EditVisitor";

export default function EditVisitorPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_VISITORS]}>
      <EditVisitor />
    </RouteGuard>
  );
}

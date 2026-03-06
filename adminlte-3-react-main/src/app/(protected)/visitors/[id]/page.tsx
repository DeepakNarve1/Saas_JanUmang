"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewVisitor from "@app/views/visitors/ViewVisitor";

export default function ViewVisitorPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_VISITORS]}>
      <ViewVisitor />
    </RouteGuard>
  );
}

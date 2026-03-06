"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateVisitor from "@app/views/visitors/CreateVisitor";

export default function CreateVisitorPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_VISITORS]}>
      <CreateVisitor />
    </RouteGuard>
  );
}

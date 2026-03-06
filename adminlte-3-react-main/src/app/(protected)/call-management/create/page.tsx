"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateCall from "@app/views/callManagement/CreateCall";

export default function CreateCallPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_CALL_MANAGEMENT]}>
    <CreateCall />
    </RouteGuard>
  );
}

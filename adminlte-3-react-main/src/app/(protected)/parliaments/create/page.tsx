"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateParliament from "@app/views/parliament/CreateParliament";

export default function CreateParliamentPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_PARLIAMENTS]}>
      <CreateParliament />
    </RouteGuard>
  );
}

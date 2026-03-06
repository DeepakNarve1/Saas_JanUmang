"use client";

import CreateDivision from "@app/views/division/CreateDivision";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateDivisionPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_DIVISIONS]}>
      <CreateDivision />
    </RouteGuard>
  );
}

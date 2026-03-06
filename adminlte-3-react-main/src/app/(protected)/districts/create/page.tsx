"use client";

import CreateDistrict from "@app/views/district/CreateDistrict";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function CreateDistrictPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_DISTRICTS]}>
      <CreateDistrict />
    </RouteGuard>
  );
}

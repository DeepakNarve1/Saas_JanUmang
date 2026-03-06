"use client";

import EditDistrict from "@app/views/district/EditDistrict";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

export default function EditDistrictPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_DISTRICTS]}>
      <EditDistrict />
    </RouteGuard>
  );
}

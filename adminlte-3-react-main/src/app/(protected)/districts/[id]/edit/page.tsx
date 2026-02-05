"use client";

import EditDistrict from "@app/views/district/EditDistrict";
import { RouteGuard } from "@app/components/RouteGuard";

export default function EditDistrictPage() {
  return (
    <RouteGuard requiredPermission="edit_districts">
      <EditDistrict />
    </RouteGuard>
  );
}

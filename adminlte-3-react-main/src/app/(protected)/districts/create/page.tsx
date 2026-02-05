"use client";

import CreateDistrict from "@app/views/district/CreateDistrict";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateDistrictPage() {
  return (
    <RouteGuard requiredPermission="create_districts">
      <CreateDistrict />
    </RouteGuard>
  );
}

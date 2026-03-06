"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import PhoneDirectoryList from "@app/views/phoneDirectory";

export default function PhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_PHONE_DIRECTORY]}>
      <PhoneDirectoryList />
    </RouteGuard>
  );
}

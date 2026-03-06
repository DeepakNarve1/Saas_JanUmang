"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewPhoneDirectory from "@app/views/phoneDirectory/ViewPhoneDirectory";

export default function ViewPhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_PHONE_DIRECTORY]}>
      <ViewPhoneDirectory />
    </RouteGuard>
  );
}

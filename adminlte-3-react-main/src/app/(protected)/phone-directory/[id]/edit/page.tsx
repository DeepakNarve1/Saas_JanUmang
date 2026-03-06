"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditPhoneDirectory from "@app/views/phoneDirectory/EditPhoneDirectory";

export default function EditPhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_PHONE_DIRECTORY]}>
      <EditPhoneDirectory />
    </RouteGuard>
  );
}

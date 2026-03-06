"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreatePhoneDirectory from "@app/views/phoneDirectory/CreatePhoneDirectory";

export default function CreatePhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_PHONE_DIRECTORY]}>
      <CreatePhoneDirectory />
    </RouteGuard>
  );
}

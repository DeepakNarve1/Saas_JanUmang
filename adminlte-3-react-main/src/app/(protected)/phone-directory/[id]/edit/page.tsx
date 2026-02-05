"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditPhoneDirectory from "@app/views/phoneDirectory/EditPhoneDirectory";

export default function EditPhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermission="edit_phone_directory">
      <EditPhoneDirectory />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewPhoneDirectory from "@app/views/phoneDirectory/ViewPhoneDirectory";

export default function ViewPhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermission="view_phone_directory">
      <ViewPhoneDirectory />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import PhoneDirectoryList from "@app/views/phoneDirectory";

export default function PhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermission="view_phone_directory">
      <PhoneDirectoryList />
    </RouteGuard>
  );
}

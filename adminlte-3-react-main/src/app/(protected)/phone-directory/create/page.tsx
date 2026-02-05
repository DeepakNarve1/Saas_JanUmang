"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreatePhoneDirectory from "@app/views/phoneDirectory/CreatePhoneDirectory";

export default function CreatePhoneDirectoryPage() {
  return (
    <RouteGuard requiredPermission="create_phone_directory">
      <CreatePhoneDirectory />
    </RouteGuard>
  );
}

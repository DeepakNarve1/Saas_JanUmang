"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateCall from "@app/views/callManagement/CreateCall";

export default function CreateCallPage() {
  return (
    <RouteGuard requiredPermission="create_call_management">
    <CreateCall />
    </RouteGuard>
  );
}

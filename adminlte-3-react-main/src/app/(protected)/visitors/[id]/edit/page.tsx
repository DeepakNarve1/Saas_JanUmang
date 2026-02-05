"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditVisitor from "@app/views/visitors/EditVisitor";

export default function EditVisitorPage() {
  return (
    <RouteGuard requiredPermission="edit_visitors">
      <EditVisitor />
    </RouteGuard>
  );
}

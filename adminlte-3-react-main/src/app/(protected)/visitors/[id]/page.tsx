"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewVisitor from "@app/views/visitors/ViewVisitor";

export default function ViewVisitorPage() {
  return (
    <RouteGuard requiredPermission="view_visitors">
      <ViewVisitor />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateVisitor from "@app/views/visitors/CreateVisitor";

export default function CreateVisitorPage() {
  return (
    <RouteGuard requiredPermission="create_visitors">
      <CreateVisitor />
    </RouteGuard>
  );
}

"use client";

import CreateDivision from "@app/views/division/CreateDivision";
import { RouteGuard } from "@app/components/RouteGuard";

export default function CreateDivisionPage() {
  return (
    <RouteGuard requiredPermission="create_divisions">
      <CreateDivision />
    </RouteGuard>
  );
}

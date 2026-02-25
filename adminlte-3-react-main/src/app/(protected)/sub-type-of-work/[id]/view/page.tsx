"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewSubTypeOfWork from "@app/views/subtypeOfWork/ViewSubTypeOfWork";

export default function ViewSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermission="view_sub_work_types">
      <ViewSubTypeOfWork />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditSubTypeOfWork from "@app/views/subtypeOfWork/EditSubTypeOfWork";

export default function EditSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermission="edit_sub_work_types">
      <EditSubTypeOfWork />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateSubTypeOfWork from "@app/views/subtypeOfWork/CreateSubTypeOfWork";

export default function CreateSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermission="create_sub_work_types">
      <CreateSubTypeOfWork />
    </RouteGuard>
  );
}

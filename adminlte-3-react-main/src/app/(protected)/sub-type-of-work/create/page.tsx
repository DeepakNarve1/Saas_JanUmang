"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateSubTypeOfWork from "@app/views/subtypeOfWork/CreateSubTypeOfWork";

export default function CreateSubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermission="create_sub_type_of_work">
      <CreateSubTypeOfWork />
    </RouteGuard>
  );
}

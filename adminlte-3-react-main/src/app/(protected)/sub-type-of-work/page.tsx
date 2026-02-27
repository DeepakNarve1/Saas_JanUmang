"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import SubTypeOfWorkList from "@app/views/subtypeOfWork";

export default function SubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermission="view_sub_work_types">
      <SubTypeOfWorkList />
    </RouteGuard>
  );
}

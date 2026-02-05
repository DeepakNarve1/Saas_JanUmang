"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import SubTypeOfWorkList from "@app/views/subtypeOfWork";

export default function SubTypeOfWorkPage() {
  return (
    <RouteGuard requiredPermission="view_sub_type_of_work">
      <SubTypeOfWorkList />
    </RouteGuard>
  );
}

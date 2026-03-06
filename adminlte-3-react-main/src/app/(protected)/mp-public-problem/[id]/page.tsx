"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewEntry from "@app/views/mpPublicProblem/ViewEntry";

export default function ViewMPProblemPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_MP_PUBLIC_PROBLEMS]}>
      <ViewEntry />
    </RouteGuard>
  );
}

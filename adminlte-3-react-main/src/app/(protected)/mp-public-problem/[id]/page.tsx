"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewEntry from "@app/views/mpPublicProblem/ViewEntry";

export default function ViewMPProblemPage() {
  return (
    <RouteGuard requiredPermission="view_mp_public_problems">
      <ViewEntry />
    </RouteGuard>
  );
}

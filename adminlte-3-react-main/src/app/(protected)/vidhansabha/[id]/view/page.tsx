"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewVidhanSabha from "@app/views/vidhanSabha/ViewVidhanSabha";

export default function ViewVidhanSabhaPage() {
  return (
    <RouteGuard requiredPermission="view_assemblies">
      <ViewVidhanSabha />
    </RouteGuard>
  );
}

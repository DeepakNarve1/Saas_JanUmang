"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateVidhanSabha from "@app/views/vidhanSabha/CreateVidhanSabha";

export default function CreateVidhanSabhaPage() {
  return (
    <RouteGuard requiredPermission="create_assemblies">
      <CreateVidhanSabha />
    </RouteGuard>
  );
}

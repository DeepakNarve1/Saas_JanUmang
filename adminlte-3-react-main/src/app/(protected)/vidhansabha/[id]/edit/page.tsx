"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditVidhanSabha from "@app/views/vidhanSabha/EditVidhanSabha";

export default function EditVidhanSabhaPage() {
  return (
    <RouteGuard requiredPermission="edit_vidhan_sabha">
      <EditVidhanSabha />
    </RouteGuard>
  );
}

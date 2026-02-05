"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import EditInDocs from "@app/views/inDocs/EditInDocs";

export default function EditInDocsPage() {
  return (
    <RouteGuard requiredPermission="edit_in_docs">
      <EditInDocs />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditInDocs from "@app/views/inDocs/EditInDocs";

export default function EditInDocsPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_IN_DOCS]}>
      <EditInDocs />
    </RouteGuard>
  );
}

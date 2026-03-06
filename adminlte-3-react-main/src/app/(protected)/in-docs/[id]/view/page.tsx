"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewInDocs from "@app/views/inDocs/ViewInDocs";

export default function ViewInDocsPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_IN_DOCS]}>
      <ViewInDocs />
    </RouteGuard>
  );
}

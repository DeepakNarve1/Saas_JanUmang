"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateInDocs from "@app/views/inDocs/CreateInDocs";

export default function CreateInDocsPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_IN_DOCS]}>
      <CreateInDocs />
    </RouteGuard>
  );
}

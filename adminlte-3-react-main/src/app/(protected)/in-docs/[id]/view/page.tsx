"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import ViewInDocs from "@app/views/inDocs/ViewInDocs";

export default function ViewInDocsPage() {
  return (
    <RouteGuard requiredPermission="view_in_docs">
      <ViewInDocs />
    </RouteGuard>
  );
}

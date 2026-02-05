"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateInDocs from "@app/views/inDocs/CreateInDocs";

export default function CreateInDocsPage() {
  return (
    <RouteGuard requiredPermission="create_in_docs">
      <CreateInDocs />
    </RouteGuard>
  );
}

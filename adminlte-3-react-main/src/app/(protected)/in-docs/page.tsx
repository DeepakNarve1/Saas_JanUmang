"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import InDocsList from "@app/views/inDocs";

export default function InDocsPage() {
  return (
    <RouteGuard requiredPermission="view_in_docs">
      <InDocsList />
    </RouteGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import InDocsList from "@app/views/inDocs";

import ModuleGuard from "@app/modules/ModuleGuard";
import { MODULE_IDS } from "@app/config/modules";

export default function InDocsPage() {
  return (
    <ModuleGuard moduleId={MODULE_IDS.IN_DOCS}>
      <RouteGuard requiredPermission="view_in_docs">
        <InDocsList />
      </RouteGuard>
    </ModuleGuard>
  );
}

"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreateBlock from "@app/views/block/CreateBlock";

export default function CreateBlockPage() {
  return (
    <RouteGuard requiredPermission="create_blocks">
      <CreateBlock />
    </RouteGuard>
  );
}

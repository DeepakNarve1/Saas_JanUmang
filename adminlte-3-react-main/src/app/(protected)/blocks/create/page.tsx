"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateBlock from "@app/views/block/CreateBlock";

export default function CreateBlockPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_BLOCKS]}>
      <CreateBlock />
    </RouteGuard>
  );
}

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewCall from "@app/views/callManagement/ViewCall";

export default function ViewCallPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_CALL_MANAGEMENT]}>
      <ViewCall />
    </RouteGuard>
  );
}

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import ViewVoter from "@app/views/voter/ViewVoter";

export default function ViewVoterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_VOTERS]}>
      <ViewVoter />
    </RouteGuard>
  );
}

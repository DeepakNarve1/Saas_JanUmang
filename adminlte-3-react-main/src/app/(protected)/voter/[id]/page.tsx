import { RouteGuard } from "@app/components/RouteGuard";
import ViewVoter from "@app/views/voter/ViewVoter";
import { PERMISSIONS } from "@app/config/permissions";

export default function ViewVoterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_VOTERS]}>
      <ViewVoter />
    </RouteGuard>
  );
}

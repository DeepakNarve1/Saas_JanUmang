import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EditVoter from "@app/views/voter/EditVoter";

export default function EditVoterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_VOTERS]}>
      <EditVoter />
    </RouteGuard>
  );
}

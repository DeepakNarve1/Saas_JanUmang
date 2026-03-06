import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreateVoter from "@app/views/voter/CreateVoter";

export default function CreateVoterPage() {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_VOTERS]}>
      <CreateVoter />
    </RouteGuard>
  );
}

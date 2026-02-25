import { RouteGuard } from "@app/components/RouteGuard";
import EditVoter from "@app/views/voter/EditVoter";

export default function EditVoterPage() {
  return (
    <RouteGuard requiredPermissions={["edit_voters"]}>
      <EditVoter />
    </RouteGuard>
  );
}

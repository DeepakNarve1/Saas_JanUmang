import { RouteGuard } from "@app/components/RouteGuard";
import CreateVoter from "@app/views/voter/CreateVoter";

export default function CreateVoterPage() {
  return (
    <RouteGuard requiredPermissions={["create_voter"]}>
      <CreateVoter />
    </RouteGuard>
  );
}

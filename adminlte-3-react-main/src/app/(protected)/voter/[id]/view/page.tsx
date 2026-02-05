import { RouteGuard } from "@app/components/RouteGuard";
import ViewVoter from "@app/views/voter/ViewVoter";

export default function ViewVoterPage() {
    return (
        <RouteGuard requiredPermissions={["view_voter"]}>
            <ViewVoter />
        </RouteGuard>
    );
}
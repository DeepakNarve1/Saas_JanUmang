import { RouteGuard } from "@app/components/RouteGuard";
import ViewCall from "@app/views/callManagement/ViewCall";

export default function ViewCallPage() {
  return (
    <RouteGuard requiredPermission="view_call_management">
      <ViewCall />
    </RouteGuard>
  );
}

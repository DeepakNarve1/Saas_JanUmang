"use client";

import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import CreatePanchayat from "@app/views/Panchayat/CreatePanchayat";

const CreatePanchayatPage = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_PANCHAYATS]}>
      <CreatePanchayat />
    </RouteGuard>
  );
};

export default CreatePanchayatPage;
